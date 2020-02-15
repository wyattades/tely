import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
import refresh from 'passport-oauth2-refresh';
import Query from 'querystring';

import * as db from './db';
import { config, SERVER_URL, ORIGIN_URL } from './env';

// TODO: necessary?
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const discordStrat = new DiscordStrategy(
  {
    clientID: config.discord.client_id,
    clientSecret: config.discord.client_secret,
    callbackURL: `${SERVER_URL}/auth/discord/callback`,
    scope: ['identify', 'email', 'guilds'],
  },
  (accessToken, refreshToken, res, profile, cb) => {
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
    db.firestore
      .doc(`/users/${profile.id}`)
      .set(profile, { merge: true })
      .catch(console.error);

    db.auth
      .createCustomToken(profile.id)
      .then((token) => {
        profile.token = token;
        cb(null, profile);
      })
      .catch(cb);
  },
);

const spotifyStrat = new SpotifyStrategy(
  {
    clientID: config.spotify.client_id,
    clientSecret: config.spotify.client_secret,
    callbackURL: `${SERVER_URL}/auth/spotify/callback`,
    scope: [
      'streaming',
      'user-read-birthdate',
      'user-read-email',
      'user-read-private',
      'user-library-modify',
    ],
  },
  (accessToken, refreshToken, expires_in, profile, cb) => {
    if (accessToken) profile.accessToken = accessToken;
    if (refreshToken) profile.refreshToken = refreshToken;
    if (expires_in) profile.expires_on = db.now().toMillis() + expires_in;
    cb(null, profile);
  },
);

passport.use(discordStrat);
passport.use(spotifyStrat);
refresh.use(discordStrat);
refresh.use(spotifyStrat);

const app = express();
app.use(passport.initialize());
app.use(express.json());
app.use(
  cors({
    origin: ORIGIN_URL,
    // allowedHeaders: 'Origin,X-Requested-With,Content-Type Accept',
  }),
);

const oauthRoutes = (provider) => {
  app.get(`/auth/${provider}`, passport.authenticate(provider));

  app.get(
    `/auth/${provider}/callback`,
    passport.authenticate(provider, {
      failureRedirect: `${ORIGIN_URL}?error=auth_error`,
    }),
    (req, res) => {
      res.redirect(`${ORIGIN_URL}?${Query.stringify(req.user)}`);
    },
  );

  app.post(`/auth/${provider}/refresh`, (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(400);

    refresh.requestNewAccessToken(
      provider,
      refreshToken,
      (err, accessToken) => {
        if (err) {
          console.error(err);
          res.status((err && err.statusCode) || 500).send(err && err.data);
        } else res.send({ accessToken });
      },
    );
  });
};

oauthRoutes('discord');
oauthRoutes('spotify');

export const oauthApp = app;
