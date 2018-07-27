const functions = require('firebase-functions');
const admin = require('firebase-admin');


const firestore = admin.firestore();
const lists = firestore.collection('lists');


const deleteQueryBatch = (query, batchSize, resolve, reject) => {
  query.get()
  .then((snap) => {
    // When there are no documents left, we are done
    if (!snap.size)
      return 0;

    // Delete documents in a batch
    const batch = firestore.batch();
    for (const doc of snap.docs) batch.delete(doc.ref);

    return batch.commit()
    .then(() => snap.size);

  })
  .then((numDeleted) => {
    if (numDeleted === 0) {
      resolve();
      return;
    }

    // Recurse on the next process tick, to avoid exploding the stack.
    process.nextTick(() => {
      deleteQueryBatch(query, batchSize, resolve, reject);
    });
  })
  .catch(reject);
};

// Max docs for batch write is 500
const deleteCollection = (collectionRef, batchSize = 100) => new Promise((resolve, reject) => {
  deleteQueryBatch(collectionRef.orderBy('__name__').limit(batchSize), batchSize, resolve, reject);
});


exports.listUpdate = functions.firestore
.document('lists/{listId}/contents/{contentId}')
.onWrite((change, ctx) => (
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
.onDelete((change) => deleteCollection(change.ref.collection('contents')));
