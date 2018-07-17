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

export const shareUser = (userId, listMeta, canWrite) => {

  const roles = Object.assign({}, listMeta.roles);
  if (roles[userId] !== 'o' && roles[userId] !== 'w') roles[userId] = canWrite ? 'w' : 'r';

  return db.lists.doc(listMeta.id).update({
    [`shared_users.${userId}`]: canWrite ? 'w' : 'r',
    roles,
  });
};

export const unshareUser = (userId, listMeta) => {

  const roles = Object.assign({}, listMeta.roles);
  const thisRole = listMeta.shared_users[userId];

  const otherRole = getHighestRole(listMeta, userId);

  // if there's no other role and not owner, delete role
  if (!otherRole && roles[userId] !== 'o') delete roles[userId];
  // if server role is w and another role is r, change to r
  else if (thisRole === 'w' && otherRole === 'r') roles[userId] = 'r';

  return db.lists.doc(listMeta.id).update({
    [`shared_users.${userId}`]: db.Helpers.FieldValue.delete(),
    roles,
  });
};

export const shareServer = (serverId, listMeta, canWrite) => db.users
.where(`guilds.${serverId}.id`, '>', '').get() // This is a hack to query where guilds.${serverId} exists
.then((snap) => {

  const userIds = {};
  const roles = Object.assign({}, listMeta.roles);

  snap.forEach(({ id: userId }) => {
    userIds[userId] = true;
    console.log(roles[userId]);
    if (roles[userId] !== 'o' && roles[userId] !== 'w') roles[userId] = canWrite ? 'w' : 'r';
  });

  return db.lists.doc(listMeta.id).update({
    [`shared_servers.${serverId}`]: {
      role: canWrite ? 'w' : 'r',
      members: userIds,
    },
    roles,
  });
});

export const unshareServer = (serverId, listMeta) => {

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
  const profile = db.getProfile();
  if (!profile) return false;
  const role = listMeta.roles[profile.id];
  return role === 'w' || role === 'o';
};

export const isOwner = (listMeta) => {
  const profile = db.getProfile();
  if (!profile) return false;
  return listMeta.roles[profile.id] === 'o';
};

// TODO: improve performance of onSnapshots with `snap.docChanges`

// export const getLists = (cb) => db.lists.where(`roles.${db.getProfile().id}`, '==', 'o')
// .onSnapshot((snap) => {
//   cb(null, snap.docs.map((doc) => {
//     const data = doc.data();
//     data.id = doc.id;
//     return data;
//   }));
// }, cb);

export const getSharedLists = (cb) => db.lists.where(`roles.${db.getProfile().id}`, '>', '')
.onSnapshot((snap) => {
  const userId = db.getProfile().id;
  const lists = [];
  const sharedLists = [];
  snap.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    if (data.roles[userId] === 'o')
      lists.push(data);
    else
      sharedLists.push(data);
  });
  cb(null, lists, sharedLists);
}, cb);
