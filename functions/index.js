const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('superagent');

const OAUTH_TOKEN_URL = 'https://discordapp.com/api/oauth2/token';
const MY_REDIRECT = 'https://wyattades.github.io/tely';
const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/428338133902295050/\
PyeWq3w6EPvC2MCTMB6wncv8JreIcaEu-nk4vyP_NuEk7BnaxDrqP0MTHKm1kCwQYdmj';

// Enable database access
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const users = db.collection('users');

exports.writeUser = functions.firestore.document('users/{userId}').onWrite((event) => {
  const newValue = event.data.data();
  const previousValue = event.data.previous.data();

  console.log(previousValue && previousValue.name, newValue && newValue.name);

});

// exports.refreshDiscordToken = functions.https.onCall((data, ctx) =>
//   userData.auth.discord.expires >= Date.now() ?
//     request('POST', OAUTH_TOKEN_URL)
//     .type('form')
//     .accept('application/json')
//     .send({
//       client_id: functions.config().discord.client_id,
//       client_secret: functions.config().discord.client_secret,
//       refresh_token: userData.auth.discord.refresh_token,
//       grant_type: 'refresh_token',
//       redirect_uri: MY_REDIRECT,
//     })
//     .then((res) =>
//       users.doc(`${uid}/auth/discord`).set({
//         access_token: res.body.access_token,
//         refresh_token: res.body.refresh_token,
//         expires: Date.now() + res.body.expires_in,
//       }))
//     .catch((err) => {
//       console.error(err);
//       return err;
//     }) : Promise.resolve(),
// );

const updateDiscordToken = functions.https.onCall((data, ctx) =>
  
  request('POST', OAUTH_TOKEN_URL)
  .type('form')
  .accept('application/json')
  .send({
    client_id: functions.config().discord.client_id,
    client_secret: functions.config().discord.client_secret,
    redirect_uri: MY_REDIRECT,
    ...req,
  })
  .then((res) =>
    .set({
      access_token: res.body.access_token,
      refresh_token: res.body.refresh_token,
      expires: Date.now() + res.body.expires_in,
    }))
  .catch((err) => {
    console.error(err);
    return err;
  }));

// firebase.firestore.FieldValue.serverTimestamp()
exports.getDiscordToken = functions.https.onCall((data, ctx) =>
  request('POST', OAUTH_TOKEN_URL)
  .type('form')
  .accept('application/json')
  .send({
    client_id: functions.config().discord.client_id,
    client_secret: functions.config().discord.client_secret,
    code: data.code,
    grant_type: 'authorization_code',
    redirect_uri: MY_REDIRECT,
  })
  .then((res) =>
    users.doc(`${ctx.auth.uid}/auth/discord`).set({
      access_token: res.body.access_token,
      refresh_token: res.body.refresh_token,
      expires: Date.now() + res.body.expires_in,
    }))
  .catch((err) => {
    console.error(err);
    return err;
  }));


exports.discordMessage = functions.https.onCall((data, ctx) =>
  request('POST', WEBHOOK_URL)
  .accept('application/json')
  .send({ content: data.msg })
  .then(() => {})
  .catch((err) => {
    console.error(err);
    return err;
  }));
