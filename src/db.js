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
export const Helpers = firebase.firestore;
// export const users = firestore.collection('users');
export const sharedGuilds = firestore.collection('shared_guilds');
export const lists = firestore.collection('lists');

// export const userDoc = () => auth.currentUser ? users.doc(auth.currentUser.uid) : Promise.reject();

export const init = () => new Promise((resolve) => {

  const unsubscribe = auth.onAuthStateChanged(() => {
    console.log('Signed in status:', !!auth.currentUser);
    unsubscribe();

    if (auth.currentUser) {
      getMe()
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
