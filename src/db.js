import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import * as API from './api';
import services from './services';
import { sendWebhooks } from './discord';


firebase.initializeApp({
  apiKey: 'AIzaSyBXbBg-6gZx7eehLHUC4GzPbAQVPgpZqp8',
  authDomain: 'tely-db.firebaseapp.com',
  databaseURL: 'https://tely-db.firebaseio.com',
  projectId: 'tely-db',
  storageBucket: 'tely-db.appspot.com',
  messagingSenderId: '591385205122',
});


const auth = firebase.auth();
const firestore = firebase.firestore();

// TEMP
firestore.settings({ timestampsInSnapshots: true });

export const Helpers = firebase.firestore;

// Collections
export const users = firestore.collection('users');
export const lists = firestore.collection('lists');

export const signOut = () => {
  API.clearProfile('discord');
  return auth.signOut();
};

export const init = () => new Promise((resolve) => {

  const unsubscribe = auth.onAuthStateChanged(() => {
    console.log('Signed in:', !!auth.currentUser);
    unsubscribe();
    resolve();
  }, (err) => {
    console.error('Sign in error:', err);
    unsubscribe();
    resolve();
  });
});

export const getUser = () => auth.currentUser;

export const getProfile = () => API.profiles.discord;

export const signIn = () => API.signIn('discord')
.then((profile) => auth.signInWithCustomToken(profile.token));

export const deleteAll = () => {
  const userId = getProfile().id;
  const batch = firestore.batch();

  batch.delete(users.doc(userId));

  return lists.where(`roles.${userId}`, '==', 'o').get()
  .then((snap) => {
    for (const doc of snap.docs) batch.delete(doc.ref);
    return batch.commit();
  });
};

const newListMeta = (name, type) => {
  const created = Helpers.Timestamp.now();
  const userId = getProfile().id;

  return {
    created,
    modified: created,
    name,
    type,
    popularity: 0,
    is_public: false,
    shared_servers: {},
    shared_users: {},
    roles: { [userId]: 'o' },
    webhooks: {},
  };
};

export const createList = (name, type) => lists.add(newListMeta(name, type));

// If force is true then delete, else if false then add,
// else if null then use item.id to determine
export const toggleListItem = (item, listContents, listMeta, force = null) => {
  item = { ...item };
  if (force === null ? item.id : !force) {
    return listContents.doc(item.id).delete()
    .then(() => {
      item.id = null;
      return item;
    });
  } else {
    const profile = getProfile();
    item.created = Helpers.Timestamp.now();
    // TODO: redundant user data
    item.creator = {
      id: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
    };
    return listContents.add(item)
    .then((snap) => {
      item.id = snap.id;
      sendWebhooks(listMeta, item);

      return item;
    });
  }
};

export const favoriteListItem = (item, type) => {
  const userId = getProfile().id;
  const favRef = lists.doc(`fav_${userId}_${type}`);
  const service = services.asObject[type];

  let listMeta;

  return favRef.get()
  .then((doc) => {
    if (doc.exists) listMeta = doc.data();
    return doc.exists;
  })
  .catch((err) => Promise.resolve(err.code !== 'permission-denied'))
  .then((exists) => {
    if (!exists) {
      listMeta = newListMeta(`${service.LABEL} Favorites`, type);
      return favRef.set(listMeta);
    }
    return Promise.resolve();
  })
  .then(() => toggleListItem(item, favRef.collection('contents'), listMeta, true));
};
