import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { decodeQuery, popupCenter } from './utils';
import { getMe } from './discord';

const AUTH_URL = 'https://us-central1-tely-db.cloudfunctions.net/widgets/auth/discord';

firebase.initializeApp({
  apiKey: 'AIzaSyBXbBg-6gZx7eehLHUC4GzPbAQVPgpZqp8',
  authDomain: 'tely-db.firebaseapp.com',
  databaseURL: 'https://tely-db.firebaseio.com',
  projectId: 'tely-db',
  storageBucket: 'tely-db.appspot.com',
  messagingSenderId: '591385205122',
});

// Potentially load current user from storage
let currentUser = null;
try {
  const str = localStorage.getItem('profile');
  currentUser = JSON.parse(str);
} catch (_) {
  // Someone put bad data in my localStorage!
}

const auth = firebase.auth();
const firestore = firebase.firestore();
export const users = firestore.collection('users');
export const lists = firestore.collection('lists');

const updateUser = (data) => {
  currentUser = Object.assign(currentUser || {}, data);
  localStorage.setItem('profile', JSON.stringify(currentUser));
};

const refreshToken = () => fetch(`${AUTH_URL}/refresh`, {
  method: 'POST',
  body: JSON.stringify({ token: currentUser.refreshToken }),
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors',
})
.then((res) => {
  if (!res.ok) throw res.statusText;
  return res.json();
})
.then(({ token }) => updateUser({ accessToken: token }))
.catch((err) => {
  // Redirect back to login when redirect token expires
  console.error('refreshToken error', err);
});

export const init = () => new Promise((resolve) => {
  // auth = firebase.auth(); // maybe necessary

  const unsubscribe = auth.onAuthStateChanged(() => {
    console.log('Signed in status:', !!auth.currentUser);
    unsubscribe();

    if (auth.currentUser) {
      getMe()
      .then((profile) => console.log('init profile', profile))
      .catch((err) => {
        if (err.code === 401) {
          return refreshToken();
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

export const signOut = () => auth.signOut();

export const getUser = () => auth.currentUser;

export const getProfile = () => currentUser;

export const signIn = () => new Promise((resolve, reject) => {

  // window.location.href = authUrl;
  const popup = popupCenter(AUTH_URL, 500, 600);
  if (!popup) throw null;

  const intervalId = window.setInterval(() => {
    if (!popup) {
      window.clearInterval(intervalId);
      throw 'Window closed unexpectedly!';
    } else if (popup.location.hostname === window.location.hostname) {
      window.clearInterval(intervalId);
      const { error, ...profile } = decodeQuery(popup.location.search);
      popup.close();

      if (profile.accessToken && !error) resolve(profile);
      else reject(error);
    }
  }, 300);

})
.then((profile) => {
  console.log(profile);
  updateUser(profile);
  return auth.signInWithCustomToken(profile.token);
});
