import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

import { decodeQuery, encodeQuery, popupCenter } from './utils';

const DISCORD_REDIRECT = window.location.hostname === 'localhost' ?
  'http://localhost:8080/authorize_discord' :
  'https://wyattades.github.com/tely/authorize_discord';

firebase.initializeApp({
  apiKey: 'AIzaSyBXbBg-6gZx7eehLHUC4GzPbAQVPgpZqp8',
  authDomain: 'tely-db.firebaseapp.com',
  databaseURL: 'https://tely-db.firebaseio.com',
  projectId: 'tely-db',
  storageBucket: 'tely-db.appspot.com',
  messagingSenderId: '591385205122',
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const functions = firebase.functions();

const provider = new firebase.auth.GoogleAuthProvider();

export const init = () => new Promise((resolve) => {
  // auth = firebase.auth(); // maybe necessary

  const unsubscribe = auth.onAuthStateChanged(() => {
    console.log('Signed in status:', !!auth.currentUser);
    unsubscribe();
    resolve();
  }, (err) => {
    console.error('Sign in error:', err);
    unsubscribe();
    resolve();
  });
});

export const signIn = () => auth.signInWithPopup(provider);

export const signOut = () => auth.signOut();

export const getUser = () => auth.currentUser;

export const fetchList = (listId) => firestore
.doc(`list/${listId}`).get()
.then((snap) => {
  const list = snap.data();
  console.log('fetchList', list);
  if (!list) throw null;
  else return [];
});

const getToken = functions.httpsCallable('discordToken');

export const authorizeDiscord = () => new Promise((resolve, reject) => {
  const query = {
    client_id: '',
    redirect_uri: DISCORD_REDIRECT,
    response_type: 'code',
    scope: 'identify email',
  };

  const popup = popupCenter(
    `https://discordapp.com/api/oauth2/authorize?${encodeQuery(query)}`,
    500, 600,
  );

  if (!popup) throw null;

  const intervalId = window.setInterval(() => {
    if (!popup) {
      window.clearInterval(intervalId);
      throw 'Window closed unexpectedly!';
    } else if (popup.location.hostname === window.location.hostname) {
      window.clearInterval(intervalId);
      const { code, error } = decodeQuery(popup.location.search);
      popup.close();

      if (code && !error) resolve(code);
      else reject(error);
    }
  }, 300);

})
.then(getToken)
.then((res) => {
  console.log('authorizeDiscord success:', res);

  localStorage.setItem('discord_access_token', res.access_token);
  localStorage.setItem('discord_refresh_token', res.refresh_token);
  localStorage.setItem('discord_expires', Date.now() + res.expires_in);
});

export const { doc, collection } = firestore;
