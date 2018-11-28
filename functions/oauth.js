const admin = require('firebase-admin');
const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const refresh = require('passport-oauth2-refresh');
const Query = require('querystring');


const firestore = admin.firestore();
firestore.settings({ timestampsInSnapshots: true });


const SERVER_URL = global.DEV
  ? 'http://localhost:5000/tely-db/us-central1/widgets'
  : 'https://us-central1-tely-db.cloudfunctions.net/widgets';
const ORIGIN_URL = global.DEV
  ? 'http://localhost:8080'
  : 'https://tely.app';

// TODO: necessary?
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const discordStrat = new DiscordStrategy({
  clientID: global.config.discord.client_id,
  clientSecret: global.config.discord.client_secret,
  callbackURL: `${SERVER_URL}/auth/discord/callback`,
  scope: [ 'identify', 'email', 'guilds' ],
}, (accessToken, refreshToken, res, profile, cb) => {
  // accessToken already included in profile
  if (refreshToken) profile.refreshToken = refreshToken;
  if (res && res.expires_in) profile.expires_on = Date.now() + res.expires_in;

  // Convert guilds array to key map
  if (Array.isArray(profile.guilds)) {
    const guilds = {};
    for (const guild of profile.guilds) guilds[guild.id] = true;
    profile.guilds = guilds;
  } else {
    cb('Failed to fetch guilds');
    return;
  }

  // Create user in database
  firestore.runTransaction((trans) => trans.get(firestore.doc(`/users/${profile.id}`))
  .then((userDoc) => {

    if (userDoc.exists) {
      return trans.update(userDoc.ref, profile);
    } else {
      return trans.set(userDoc.ref, profile);
    }
  }))
  .catch(console.error);

  admin.auth().createCustomToken(profile.id)
  .then((token) => {
    profile.token = token;
    cb(null, profile);
  })
  .catch(cb);
});

const spotifyStrat = new SpotifyStrategy({
  clientID: global.config.spotify.client_id,
  clientSecret: global.config.spotify.client_secret,
  callbackURL: `${SERVER_URL}/auth/spotify/callback`,
  scope: [ 'streaming', 'user-read-birthdate', 'user-read-email', 'user-read-private', 'user-library-modify' ],
}, (accessToken, refreshToken, expires_in, profile, cb) => {
  if (accessToken) profile.accessToken = accessToken;
  if (refreshToken) profile.refreshToken = refreshToken;
  if (expires_in) profile.expires_on = admin.firestore.Timestamp.now().toMillis() + expires_in;
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
  res.header('Access-Control-Allow-Origin', ORIGIN_URL);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const oauthRoutes = (service) => {
  app.get(`/auth/${service}`, passport.authenticate(service));

  app.get(`/auth/${service}/callback`, passport.authenticate(service, {
    failureRedirect: `${ORIGIN_URL}?error=auth_error`,
  }), (req, res) => {
    res.redirect(`${ORIGIN_URL}?${Query.stringify(req.user)}`);
  });
  
  app.post(`/auth/${service}/refresh`, (req, res) => {
  
    const refreshToken = req.body.token;
    if (!refreshToken) {
      res.status(400).end();
      return;
    }
  
    refresh.requestNewAccessToken(service, refreshToken, (err, token) => {
      if (err) res.status((err && err.status) || 500).send(err);
      else res.send({ token });
    });
  });
};

oauthRoutes('discord');
oauthRoutes('spotify');

module.exports = app;
