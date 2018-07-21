const functions = require('firebase-functions');
const admin = require('firebase-admin');


const firestore = admin.firestore();
const lists = firestore.collection('lists');


exports.listUpdate = functions.firestore
.document('lists/{listId}/contents/{contentId}')
.onWrite((change, ctx) => (
  firestore.runTransaction((trans) => (
    trans.get(lists.doc(ctx.params.listId))
    .then((doc) => trans.update(doc.ref, {
      popularity: (doc.data().popularity || 0) + 1,
      modified: Date.now(),
    }))
  ))
));
