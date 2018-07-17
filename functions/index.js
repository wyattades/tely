const functions = require('firebase-functions');
const admin = require('firebase-admin');


const config = functions.config();

// Store service account credentials in base64 to simplify env variables
const SERVICE_ACCOUNT = JSON.parse(Buffer.from(config.admin.account, 'base64').toString('ascii'));

// Enable database access
admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT),
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(require('./oauth'));

// Export database triggers
Object.assign(exports, require('./triggers'));
