import * as functions from 'firebase-functions';
import 'isomorphic-fetch';

import './db';

import { oauthApp } from './oauth';

// Expose Express API as a single Cloud Function:
export const widgets = functions.https.onRequest(oauthApp);

export * from './services';

// Export database triggers
export * from './triggers';
