import * as functions from 'firebase-functions';

import { deleteCollection } from './utils';
import * as db from './db';

const lists = db.firestore.collection('lists');

export const listUpdate = functions.firestore
  .document('lists/{listId}/contents/{contentId}')
  .onWrite(async (snap, ctx) => {
    await lists.doc(ctx.params.listId).update({
      popularity: db.FieldValue.increment(),
      modified: db.now(),
    });
  });

export const deleteList = functions.firestore
  .document('lists/{listId}')
  .onDelete(async (snap) => {
    await deleteCollection(snap.ref.collection('contents'));
  });

export const createUser = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap) => {
    const profile = snap.data();
    const batch = db.firestore.batch();

    // Add this user to all lists that share with one of their servers
    // This is a very expensive operation, so only do it on account creation
    await Promise.all(
      Object.keys(profile.guilds).map((guildId) =>
        lists
          .where(`shared_servers.${guildId}.role`, '>', '')
          .get()
          .then((listsSnap) => {
            // TODO: might need to handle if shared_users contains profile.id
            for (const doc of listsSnap.docs)
              batch.update(doc.ref, {
                [`shared_servers.${guildId}.members.${profile.id}`]: true,
                [`roles.${profile.id}`]: doc.data().shared_servers[guildId]
                  .role,
              });
          }),
      ),
    );

    try {
      await batch.commit();
    } catch (err) {
      console.error('batch share servers:', err);
    }

    await snap.ref
      .collection('labels')
      .doc('favorites')
      .set({
        // add a default label: Favorites
        name: 'Favorites',
        color: 3, // green
      });
  });

export const deleteUser = functions.firestore
  .document('users/{userId}')
  .onDelete(async (snap) => {
    await Promise.all([
      deleteCollection(snap.ref.collection('label')),
      deleteCollection(snap.ref.collection('labelItems')),
      deleteCollection(lists.where(`roles.${snap.id}`, '==', 'o')),
    ]);
  });
