import * as db from './db';

// TODO: use individual field updates instead of entires role object?
// TODO: use transaction. Not a big deal if we are sure only one client modifies at a time
// TODO: move to onWrite function OR make super robust db rules
// TODO: probably can remove some redundant logic

const getHighestRole = (listMeta, userId, excludeServer) => {
  let canRead = false;

  const userRole = listMeta.shared_users[userId];
  if (userRole === 'w') return 'w';
  else if (userRole === 'r') canRead = true;

  for (const serverId in listMeta.shared_servers) {
    if (serverId !== excludeServer) {
      const server = listMeta.shared_servers[serverId];
      if (userId in server.members) {
        if (server.role === 'w') return 'w';
        else if (server.role === 'r') canRead = true;
      }
    }
  }

  return canRead ? 'r' : null;
};

export const shareUser = async (userId, listMeta, canWrite) => {
  const roles = Object.assign({}, listMeta.roles);
  if (roles[userId] !== 'o' && roles[userId] !== 'w')
    roles[userId] = canWrite ? 'w' : 'r';

  await db.lists.doc(listMeta.id).update({
    [`shared_users.${userId}`]: canWrite ? 'w' : 'r',
    roles,
  });
};

export const unshareUser = async (userId, listMeta) => {
  const roles = Object.assign({}, listMeta.roles);
  const thisRole = listMeta.shared_users[userId];

  const otherRole = getHighestRole(listMeta, userId);

  // if there's no other role and not owner, delete role
  if (!otherRole && roles[userId] !== 'o') delete roles[userId];
  // if server role is w and another role is r, change to r
  else if (thisRole === 'w' && otherRole === 'r') roles[userId] = 'r';

  await db.lists.doc(listMeta.id).update({
    [`shared_users.${userId}`]: db.Helpers.FieldValue.delete(),
    roles,
  });
};

// TODO: should be transaction?
export const shareServer = async (serverId, listMeta, canWrite) => {
  const snap = await db.users.where(`guilds.${serverId}`, '==', true).get();

  const userIds = {};
  const roles = { ...listMeta.roles };

  for (const { id: userId } of snap.docs) {
    userIds[userId] = true;
    if (roles[userId] !== 'o' && roles[userId] !== 'w')
      roles[userId] = canWrite ? 'w' : 'r';
  }

  await db.lists.doc(listMeta.id).update({
    [`shared_servers.${serverId}`]: {
      role: canWrite ? 'w' : 'r',
      members: userIds,
    },
    roles,
  });
};

// TODO: should be a transaction?
export const unshareServer = async (serverId, listMeta) => {
  const roles = Object.assign({}, listMeta.roles);
  const thisRole = listMeta.shared_servers[serverId].role;

  for (const userId in listMeta.shared_servers[serverId].members) {
    const otherRole = getHighestRole(listMeta, userId, serverId);

    // if there's no other role, delete role
    if (!otherRole && roles[userId] !== 'o') delete roles[userId];
    // if server role is w and another role is r, change to r
    else if (thisRole === 'w' && otherRole === 'r') roles[userId] = 'r';
  }

  return db.lists.doc(listMeta.id).update({
    [`shared_servers.${serverId}`]: db.Helpers.FieldValue.delete(),
    roles,
  });
};

export const canWrite = (listMeta) => {
  const userId = db.getUserId();
  if (!userId) return false;

  const role = listMeta.roles[userId];
  return role === 'w' || role === 'o';
};

export const isOwner = (listMeta) => {
  const userId = db.getUserId();
  if (!userId) return false;

  return listMeta.roles[userId] === 'o';
};

// TODO: improve performance of onSnapshots with `snap.docChanges`

export const getSharedLists = (cb) =>
  db.lists.where(`roles.${db.getUserId()}`, '>', '').onSnapshot((snap) => {
    const userId = db.getUserId();
    const lists = [];
    const sharedLists = [];

    for (const doc of snap.docs) {
      const data = doc.data();
      data.id = doc.id;
      if (data.roles[userId] === 'o') lists.push(data);
      else sharedLists.push(data);
    }

    cb(null, lists, sharedLists);
  }, cb);
