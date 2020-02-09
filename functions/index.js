const functions = require('firebase-functions');
const admin = require('firebase-admin');

global.DEV = process.env.NODE_ENV === 'development';
global.config = functions.config();

// Enable database access
const cert = require('./credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(cert),
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(require('./oauth'));

// Export database triggers
Object.assign(exports, require('./triggers'));
