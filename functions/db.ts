import admin from 'firebase-admin';

import { IS_DEV_ENV, PROJECT_ID } from './env';

export const app = admin.initializeApp({
  credential: IS_DEV_ENV
    ? admin.credential.cert(require('./credentials.json'))
    : admin.credential.applicationDefault(),
  databaseURL: false // TEMP
    ? 'http://localhost:8080'
    : `https://${PROJECT_ID}.firebaseio.com`,
  projectId: PROJECT_ID,
});

export const auth = app.auth();
export const firestore = app.firestore();

export const now = () => admin.firestore.Timestamp.now();

export const FieldValue = admin.firestore.FieldValue;
