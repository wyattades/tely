import firebase from 'firebase-admin';

/**
 * This file is shared between frontend and backend
 * `firebase-admin` is aliased to `firebase/app` on frontend
 */

export const roleClick = (e) =>
  (e.which || e.charCode || e.keyCode) === 13 && e.target.click();

export const isEmpty = (obj) => {
  for (const _ in obj) return false;
  return true;
};

export const randInt = (a, b) => Math.floor(Math.random() * (b - a) + a);

export const arrSample = (arr, n, clone = false) => {
  const sample = clone ? arr.slice(0) : arr;

  n = Math.min(arr.length, n);

  const last = arr.length - 1;
  for (let index = 0; index < n; index++) {
    const rand = randInt(index, last);
    const temp = sample[index];
    sample[index] = sample[rand];
    sample[rand] = temp;
  }
  return sample.slice(0, n);
};

export const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const arrUnique = (arr) => {
  return [...new Set(arr).values()];
};

export const encodeQuery = (obj) => {
  const str = [];
  for (const key in obj) {
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
  }
  return str.join('&');
};

export const decodeQuery = (str) => {
  if (str.startsWith('?')) str = str.substr(1);

  let match;
  const search = /([^&=]+)=?([^&]*)/g;

  const obj = {};
  while ((match = search.exec(str))) {
    obj[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }

  return obj;
};

export const sameSet = (A, B) => {
  if (!A || !B || typeof A !== 'object' || typeof B !== 'object') return false;

  const keysA = Object.keys(A).sort(),
    keysB = Object.keys(B).sort();

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return false;
  }

  return true;
};

// Courtosy of https://stackoverflow.com/a/16861050/6656308
// Handles multiple monitors
export const popupCenter = (url, w, h) => {
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  const { width, height } = window.screen;

  const left = width / 2 - w / 2 + dualScreenLeft;
  const top = height / 2 - h / 2 + dualScreenTop;
  const newWindow = window.open(
    url,
    '_blank',
    `scrollbars=yes,width=${w},height=${h},top=${top},left=${left}`,
  );

  // Puts focus on the newWindow
  if (window.focus) {
    newWindow.focus();
  }

  return newWindow;
};

export const toDate = (time) => {
  if (!time) return null;

  if (typeof time === 'number') return new Date(time);
  if (typeof time === 'string') {
    const date = Date.parse(time);
    return Number.isNaN(date) ? null : new Date(date);
  }
  if (time instanceof Date) return time;
  if (time instanceof firebase.firestore.Timestamp) return time.toDate();

  return null;
};

// NOTE: Timestamp.fromMillis() is broken, so using fromDate()
export const toTimestamp = (time) => {
  if (!time) return null;

  if (typeof time === 'number')
    return firebase.firestore.Timestamp.fromDate(new Date(time));
  if (typeof time === 'string') {
    const millis = Date.parse(time);
    return Number.isNaN(millis)
      ? null
      : firebase.firestore.Timestamp.fromDate(new Date(time));
  }
  if (time instanceof Date) return firebase.firestore.Timestamp.fromDate(time);
  if (time instanceof firebase.firestore.Timestamp) return time;

  return null;
};

const timeAgoString = (label, amount) =>
  `${amount} ${label}${amount === 1 ? '' : 's'} ago`;

export const timeAgo = (date) => {
  date = toDate(date);
  if (!date) return null;

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  let minutes, hours, days, weeks, months;

  if (seconds < 90) return 'Just now';
  else if ((minutes = Math.round(seconds / 60)) < 6) return 'A few minutes ago';
  else if (minutes < 60) return timeAgoString('minute', minutes);
  else if ((hours = Math.round(minutes / 60)) < 12)
    return timeAgoString('hour', hours);
  else if ((days = Math.round(hours / 24)) < 7)
    return timeAgoString('day', days);
  else if ((weeks = Math.round(days / 7)) < 4)
    return timeAgoString('week', weeks);
  else if ((months = Math.round(days / 30)) < 12)
    return timeAgoString('month', months);
  else return timeAgoString('year', Math.round(days / 365));
};

export const onSnap = (ref, cb) =>
  ref.onSnapshot(
    (snap) => {
      const items = snap.docs.map((doc) => {
        const itemData = doc.data();
        itemData.id = doc.id;
        return itemData;
      });
      cb(null, items);
    },
    (error) => cb(error, null),
  );

export const waitFor = async (fn, { interval = 300, timeout } = {}) => {
  return new Promise((resolve, reject) => {
    let timeoutRef;
    const intervalRef = setInterval(async () => {
      try {
        if (await fn()) {
          resolve();
          clearInterval(intervalRef);
          clearTimeout(timeoutRef);
        }
      } catch (err) {
        reject(err);
        clearInterval(intervalRef);
        clearTimeout(timeoutRef);
      }
    }, interval);

    if (timeout)
      timeoutRef = setTimeout(() => {
        reject();
        clearInterval(intervalRef);
        clearTimeout(timeoutRef);
      });
  });
};
