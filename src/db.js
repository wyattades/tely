import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
// import { EventEmitter } from 'events';

import * as API from './api';
import { sendWebhooks } from './discord';
import { onSnap, isEmpty, decodeQuery } from './utils';


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

// Global collections
/** @type firebase.firestore.CollectionReference */
export let users;
/** @type firebase.firestore.CollectionReference */
export let lists;
/** @type firebase.firestore.CollectionReference */
let labels;
/** @type firebase.firestore.CollectionReference */
let labelItems;

export const getUser = () => auth.currentUser;

export const getProfile = () => API.profiles.discord;

const listenLabels = () => {
  const userRef = users.doc(getProfile().id);
  labels = userRef.collection('labels');
  labelItems = userRef.collection('labelItems');
};

export const init = () => firestore.enablePersistence()
.catch((err) => {
  if (err.code === 'failed-precondition')
    console.warn('Failed to initialize caching because multiple sessions are open');
  else
    console.error(err);
})
.then(new Promise((resolve) => {
  const unsubscribe = auth.onAuthStateChanged(() => {
    console.log('Signed in:', !!auth.currentUser);
    unsubscribe();
    resolve();
  }, (err) => {
    console.error('Sign in error:', err);
    unsubscribe();
    resolve();
  });
}))
.then(() => {
  users = firestore.collection('users');
  lists = firestore.collection('lists');

  if (getProfile()) {
    listenLabels();
  }
});

export const signIn = () => API.signIn('discord')
.then((profile) => auth.signInWithCustomToken(profile.token))
.then(() => {

  listenLabels();

  const { from } = decodeQuery(window.location.search);
  return from && from.startsWith('/') && from;
});

export const signOut = () => {
  API.clearProfile('discord');
  return auth.signOut();
};

export const deleteAll = () => {
  const userId = getProfile().id;
  return users.doc(userId).delete();
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

export const getLabels = (cb) => onSnap(labels, cb);

export const createLabel = (name, color) => labels.add({
  name,
  color,
});

export const updateLabel = (id, meta) => labels.doc(id).update(meta);

export const deleteLabel = (id) => {
  const batch = firestore.batch();

  batch.delete(labels.doc(id));

  const queryField = `labels.${id}`;

  return labelItems.where(queryField, '==', true).get()
  .then((snap) => {
    for (const doc of snap.docs) {
      const itemData = doc.data();
      delete itemData.labels[id];
      if (isEmpty(itemData.labels))
        batch.delete(doc.ref);
      else
        batch.update(doc.ref, {
          [queryField]: Helpers.FieldValue.delete(),
        });
    }
    return batch.commit();
  });
};


// TODO This method allows duplicate items
export const addItemLabel = (item, labelId, listId) => (
  firestore.runTransaction((trans) => {
    const ref = labelItems.doc(item.id);
    return (item.labels ? Promise.resolve(true) : trans.get(ref).then((doc) => doc.exists))
    .then((exists) => {
      if (exists) {
        return trans.update(ref, {
          [`labels.${labelId}`]: true,
          listId,
        });
      } else {
        const newItem = {
          ...item,
          labels: { [labelId]: true },
          listId,
        };
        delete newItem.creator;
        return trans.set(ref, newItem);
      }
    });
  })
);

// TODO use transaction?
export const removeItemLabel = (labelItem, labelId) => {
  delete labelItem.labels[labelId];
  if (isEmpty(labelItem.labels))
    return labelItems.doc(labelItem.id).delete();
  return labelItems.doc(labelItem.id).update({
    [`labels.${labelId}`]: Helpers.FieldValue.delete(),
  });
};

export const listLabelMap = (listId, cb) => labelItems.where('listId', '==', listId)
.onSnapshot((snap) => {
  const map = {};
  snap.forEach((doc) => {
    map[doc.id] = doc.data().labels;
  });
  cb(null, map);
}, (err) => cb(err, null));

export const selectByLabel = (labelId, cb) => onSnap(labelItems.where(`labels.${labelId}`, '==', true), cb);
