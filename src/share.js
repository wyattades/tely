import * as db from './db';


const perms = db.permissions;

const getPermId = (userId, listId) => `${userId}_${listId}`;

export const setPermission = (userId, listId, canRead, canWrite, serverId) => {
  const permRef = perms.doc(getPermId(userId, listId));
  if (!canRead) return permRef.delete();

  return permRef.set({
    user_id: userId,
    list_id: listId,
    can_write: !!canWrite,
    server_id: serverId || null,
  });
};

// TODO: convert to batch write
export const setPermissionMembers = (serverId, listId, canRead, canWrite) => {

  const p1 = db.lists.doc(listId).update({
    shared_servers: {
      [listId]: canRead ? { can_write: !!canWrite } : db.Helpers.FieldValue.delete(),
    },
  });

  const p2 = db.users.where(`servers.${serverId}`, '==', true).get()
  .then((snap) => Promise.all(snap.docs.map(({ id }) => setPermission(id, listId, canRead, canWrite, serverId))));

  return Promise.all([ p1, p2 ]);
};

export const canRead = (listMeta) => {
  const userId = db.getProfile().id;

  if (listMeta.owner === userId) return Promise.resolve(true);

  return perms.doc(getPermId(userId, listMeta.id)).get()
  .then((doc) => doc.exists);
};

export const canWrite = (listMeta) => {
  const userId = db.getProfile().id;

  if (listMeta.owner === userId) return Promise.resolve(true);

  return perms.doc(getPermId(userId, listMeta.id)).get()
  .then((doc) => doc.exists && doc.data().can_write === true);
};

// TODO: improve performance with `snap.docChanges`
// TODO: somehow convert to single query?
export const getSharedLists = (cb) => perms.where('user_id', '==', db.getProfile().id).onSnapshot((snap) => {
  Promise.all(snap.docs.map((doc) => db.lists.doc(doc.data().list_id).get()))
  .then((docs) => cb(docs.map((doc) => {
    const data = doc.data();
    data.id = doc.id;
    return data;
  })));
});

export const getListSharedUsers = (listId, cb) => perms.where('list_id', '==', listId).onSnapshot((snap) => {
  cb(snap.docs.map((doc) => doc.data().user_id));
});

const t = (listId) => db.users.where(`servers.${listId}`, '==', true)
