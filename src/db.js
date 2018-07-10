import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { getMe } from './discord';
import * as API from './api';


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

// TEMP
firestore.settings({ timestampsInSnapshots: true });

export const Helpers = firebase.firestore;

// Collections
export const permissions = firestore.collection('permissions');
export const users = firestore.collection('users');
export const lists = firestore.collection('lists');

export const init = () => new Promise((resolve) => {

  const unsubscribe = auth.onAuthStateChanged(() => {
    console.log('Signed in status:', !!auth.currentUser);
    unsubscribe();

    // TODO: better way to do this (user expires_in???)
    if (auth.currentUser) {
      getMe() // Check if logged in
      .then((profile) => console.log('init profile', profile))
      .catch((err) => {
        if (err.code === 401) {
          return API.refreshToken('discord');
        } else {
          console.error('getMe error', err);
          return Promise.resolve();
        }
      })
      .then(resolve);
    } else {
      resolve();
    }

  }, (err) => {
    console.error('Sign in error:', err);
    unsubscribe();
    resolve();
  });
});

export const signOut = () => API.clearProfile('discord') || auth.signOut();

export const getUser = () => auth.currentUser;

export const getProfile = () => API.profiles.discord;

export const signIn = () => API.signIn('discord')
.then((profile) => auth.signInWithCustomToken(profile.token));
