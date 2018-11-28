const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { deleteCollection } = require('./utils');

const firestore = admin.firestore();
const lists = firestore.collection('lists');


exports.listUpdate = functions.firestore
.document('lists/{listId}/contents/{contentId}')
.onWrite((snap, ctx) => (
  firestore.runTransaction((trans) => (
    trans.get(lists.doc(ctx.params.listId))
    .then((doc) => {
      if (doc.exists)
        return trans.update(doc.ref, {
          popularity: (doc.data().popularity || 0) + 1,
          modified: admin.firestore.Timestamp.now(),
        });
      return Promise.resolve();
    })
  ))
));

exports.deleteList = functions.firestore
.document('lists/{listId}')
.onDelete((snap) => deleteCollection(snap.ref.collection('contents')));

exports.createUser = functions.firestore
.document('users/{userId}')
.onCreate((snap) => {
  const profile = snap.data();
  const batch = firestore.batch();

  // Add this user to all lists that share with one of his servers
  // This is a very expensive operation, so only do it on account creation
  return Promise.all(Object.keys(profile.guilds).map((guildId) => (
    lists.where(`shared_servers.${guildId}.role`, '>', '')
    .get()
    .then((listsSnap) => {
      // TODO: might need to handle if shared_users contains profile.id
      for (const doc of listsSnap.docs)
        batch.update(doc.ref, {
          [`shared_servers.${guildId}.members.${profile.id}`]: true,
          [`roles.${profile.id}`]: doc.data().shared_servers[guildId].role,
        });
    })
  )))
  .then(() => batch.commit())
  .catch((err) => console.error('batch share servers:', err))
  .then(() => snap.ref.collection('labels').doc('favorites').set({ // add a default label: Favorites
    name: 'Favorites',
    color: 3, // green
  }));
});

exports.deleteUser = functions.firestore
.document('users/{userId}')
.onDelete((snap) => Promise.all([
  deleteCollection(snap.ref.collection('label')),
  deleteCollection(snap.ref.collection('labelItems')),
  deleteCollection(lists.where(`roles.${snap.id}`, '==', 'o')),
]));
