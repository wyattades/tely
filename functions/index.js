const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const refresh = require('passport-oauth2-refresh');
const Query = require('querystring');


const config = functions.config();

const SERVER_URL = config.admin.mode === 'development'
  ? 'http://localhost:5000/tely-db/us-central1/widgets'
  : 'https://us-central1-tely-db.cloudfunctions.net/widgets';
const ORIGIN = config.admin.mode === 'development'
  ? 'http://localhost:8080'
  : 'https://wyattades.github.io';
const ORIGIN_URL = `${ORIGIN}/tely`;

// Store service account credentials in base64 to simplify env variables
const SERVICE_ACCOUNT = JSON.parse(Buffer.from(config.admin.account, 'base64').toString('ascii'));

// Enable database access
admin.initializeApp({
  credential: admin.credential.cert(SERVICE_ACCOUNT),
});

// TODO: necessary?
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const discordStrat = new DiscordStrategy({
  clientID: config.discord.client_id,
  clientSecret: config.discord.client_secret,
  callbackURL: `${SERVER_URL}/auth/discord/callback`,
  scope: [ 'identify', 'email', 'guilds' ],
}, (accessToken, refreshToken, res, profile, cb) => {
  // accessToken already included in profile
  if (refreshToken) profile.refreshToken = refreshToken;
  if (res && res.expires_in) profile.expires_on = Date.now() + res.expires_in;

  admin.auth().createCustomToken(profile.id)
  .then((token) => {
    profile.token = token;
    cb(null, profile);
  })
  .catch(cb);
});

const spotifyStrat = new SpotifyStrategy({
  clientID: config.spotify.client_id,
  clientSecret: config.spotify.client_secret,
  callbackURL: `${SERVER_URL}/auth/spotify/callback`,
  scope: ['streaming', 'user-read-birthdate', 'user-read-email', 'user-read-private'],
}, (accessToken, refreshToken, expires_in, profile, cb) => {
  if (accessToken) profile.accessToken = accessToken;
  if (refreshToken) profile.refreshToken = refreshToken;
  if (expires_in) profile.expires_on = Date.now() + expires_in;
  cb(null, profile);
});

passport.use(discordStrat);
passport.use(spotifyStrat);
refresh.use(discordStrat);
refresh.use(spotifyStrat);

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
// TODO: abstractify authenticators

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: `${ORIGIN_URL}?error`,
}), (req, res) => {
  res.redirect(`${ORIGIN_URL}?${Query.stringify(req.user)}`);
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


app.get('/auth/spotify', passport.authenticate('spotify'));

app.get('/auth/spotify/callback', passport.authenticate('spotify', {
  failureRedirect: `${ORIGIN_URL}?error`,
}), (req, res) => {
  res.redirect(`${ORIGIN_URL}?${Query.stringify(req.user)}`);
});

app.post('/auth/spotify/refresh', (req, res) => {

  const refreshToken = req.body.token;
  if (!refreshToken) {
    res.status(400).end();
    return;
  }

  refresh.requestNewAccessToken('spotify', refreshToken, (err, accessToken) => {
    if (err) res.status((err && err.status) || 500).send(err);
    else res.send({ token: accessToken });
  });
});

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);
