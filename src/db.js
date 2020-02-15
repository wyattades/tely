import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import * as API from './api';
import { sendWebhooks } from './discord';
import { onSnap, isEmpty, decodeQuery } from './utils';
import { APP_CONFIG, IS_DEV_ENV } from './env';

const app = firebase.initializeApp(APP_CONFIG);

const auth = app.auth();
const firestore = app.firestore();
const functions = app.functions();

if (IS_DEV_ENV) functions.useFunctionsEmulator('http://localhost:5000');

const callableCache = {};
export const callable = (name, data) =>
  (callableCache[name] = callableCache[name] || functions.httpsCallable(name))(
    data,
  );

export const Helpers = firebase.firestore;

// Global collections
/** @type firebase.firestore.CollectionReference */
export let users;
/** @type firebase.firestore.CollectionReference */
export let lists;
/** @type firebase.firestore.CollectionReference */
export let labels;
/** @type firebase.firestore.CollectionReference */
export let labelItems;

export const getAuthUser = () => auth.currentUser;

export const getUserId = () => (auth.currentUser ? auth.currentUser.uid : null);

export const isLoggedIn = () => !!getUserId();

export const getProfile = () => API.getProfile('discord');

const listenLabels = () => {
  const userRef = users.doc(getUserId());
  labels = userRef.collection('labels');
  labelItems = userRef.collection('labelItems');
};

export const init = async () => {
  try {
    await firestore.enablePersistence();
  } catch (err) {
    if (err.code === 'failed-precondition')
      console.warn(
        'Failed to initialize caching because multiple sessions are open',
      );
    else console.error(err);
  }

  users = firestore.collection('users');
  lists = firestore.collection('lists');

  await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(
      () => {
        console.log('Signed in:', !!auth.currentUser);
        unsubscribe();
        resolve();
      },
      (err) => {
        console.error('Sign in error:', err);
        unsubscribe();
        resolve();
      },
    );
  });

  if (auth.currentUser) {
    listenLabels();
  }
};

export const signIn = async () => {
  const profile = await API.signIn('discord');

  await auth.signInWithCustomToken(profile.token);

  listenLabels();

  const { from } = decodeQuery(window.location.search);
  if (from && from.startsWith('/')) return from;
  else if (window.location.pathname === '/') return '/list';
  else return window.location.pathname;
};

export const signOut = async () => {
  API.clearProfile('discord');
  await auth.signOut();
};

export const deleteAll = async () => {
  await users.doc(getUserId()).delete();
};

const newListMeta = (name, type) => {
  const created = Helpers.Timestamp.now();
  const userId = getUserId();

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

export const createList = async (name, type) =>
  lists.add(newListMeta(name, type));

// If force is true then delete, else if false then add,
// else if null then use item.id to determine
export const toggleListItem = async (
  item,
  listContents,
  listMeta,
  force = null,
) => {
  item = { ...item };
  if (force === null ? item.id : !force) {
    await listContents.doc(item.id).delete();

    item.id = null;
    return item;
  } else {
    const profile = API.getProfile('discord');
    item.created = Helpers.Timestamp.now();
    // TODO: redundant user data
    item.creator = {
      id: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
    };

    const snap = await listContents.add(item);
    item.id = snap.id;
    sendWebhooks(listMeta, item);

    return item;
  }
};

export const getLabels = (cb) => onSnap(labels, cb);

export const createLabel = async (name, color) =>
  labels.add({
    name,
    color,
  });

export const updateLabel = async (id, meta) => labels.doc(id).update(meta);

export const deleteLabel = async (id) => {
  const batch = firestore.batch();

  batch.delete(labels.doc(id));

  const queryField = `labels.${id}`;

  const snap = await labelItems.where(queryField, '==', true).get();

  for (const doc of snap.docs) {
    const itemData = doc.data();
    delete itemData.labels[id];
    if (isEmpty(itemData.labels)) batch.delete(doc.ref);
    else
      batch.update(doc.ref, {
        [queryField]: Helpers.FieldValue.delete(),
      });
  }

  await batch.commit();
};

// TODO This method allows duplicate items
export const addItemLabel = async (item, labelId, listId) => {
  await firestore.runTransaction(async (trans) => {
    const ref = labelItems.doc(item.id);

    const exists = item.labels ? true : (await trans.get(ref)).exists;

    if (exists) {
      await trans.update(ref, {
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
      await trans.set(ref, newItem);
    }
  });
};

export const removeItemLabel = async (labelItem, labelId) => {
  await firestore.runTransaction(async (trans) => {
    const labelItemRef = labelItems.doc(labelItem.id);
    const itemSnap = await trans.get(labelItemRef);

    if (!itemSnap.exists) return;

    const item = itemSnap.data();

    const newLabels = { ...(item.labels || {}) };
    const containsThisLabel = labelId in newLabels;
    delete newLabels[labelId];

    if (isEmpty(newLabels)) await trans.delete(labelItemRef);
    else if (containsThisLabel)
      await trans.update(labelItemRef, {
        [`labels.${labelId}`]: Helpers.FieldValue.delete(),
      });
  });
};

export const listLabelMap = (listId, cb) =>
  labelItems.where('listId', '==', listId).onSnapshot(
    (snap) => {
      const map = {};
      for (const doc of snap.docs) {
        map[doc.id] = doc.get('labels');
      }
      cb(null, map);
    },
    (err) => cb(err, null),
  );

export const selectByLabel = (labelId, cb) =>
  onSnap(labelItems.where(`labels.${labelId}`, '==', true), cb);
