const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const refresh = require('passport-oauth2-refresh');
const Query = require('querystring');

const config = functions.config();

const CALLBACK_URL = 'https://us-central1-tely-db.cloudfunctions.net/widgets/auth/discord/callback';
const SCOPES = [ 'identify', 'email', 'guilds' ];
const ORIGIN = 'http://localhost:8080'; // TEMP
const ORIGIN_URL = `${ORIGIN}/tely`;

// Store service account credentials in base64 to simplify env variables
const SERVICE_ACCOUNT = JSON.parse(Buffer.from(config.admin.account, 'base64').toString('ascii'));

// Enable database access
admin.initializeApp({
  databaseURL: config.firebase.databaseURL,
  credential: admin.credential.cert(SERVICE_ACCOUNT),
});

// TODO: necessary?
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const discordStrat = new DiscordStrategy({
  clientID: config.discord.client_id,
  clientSecret: config.discord.client_secret,
  callbackURL: CALLBACK_URL,
  scope: SCOPES,
}, (accessToken, refreshToken, profile, cb) => {

  if (refreshToken) profile.refreshToken = refreshToken;

  admin.auth().createCustomToken(profile.id)
  .then((token) => {
    profile.token = token;
    cb(null, profile);
  })
  .catch(cb);
});

passport.use(discordStrat);
refresh.use(discordStrat);

const app = express();
app.use(passport.initialize());
app.use(express.json());

// CORS!
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// build multiple CRUD interfaces:

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: `${ORIGIN_URL}?error`,
}), (req, res) => {
  res.redirect(`${ORIGIN_URL}/list?${Query.stringify(req.user)}`);
});

app.post('/auth/discord/refresh', (req, res) => {

  const refreshToken = req.body.token;
  if (!refreshToken) {
    res.status(400).end();
    return;
  }

  refresh.requestNewAccessToken('discord', refreshToken, (err, accessToken) => {
    if (err) res.status((err && err.status) || 500).send(err);
    else res.send({ token: accessToken });
  });
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);
