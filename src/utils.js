
export const roleClick = (e) => (e.which || e.charCode || e.keyCode) === 13 && e.target.click();

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
  while (match = search.exec(str)) {
    obj[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }

  return obj;
};

export const sameSet = (A, B) => {
  if (A !== B || typeof A !== 'object' || typeof B !== 'object') return false;
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
  const dualScreenLeft = window.screenLeft !== undefined
    ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined
    ? window.screenTop : window.screenY;

  const { width, height } = window.screen;

  const left = ((width / 2) - (w / 2)) + dualScreenLeft;
  const top = ((height / 2) - (h / 2)) + dualScreenTop;
  const newWindow = window.open(
    url, '_blank',
    `scrollbars=yes,width=${w},height=${h},top=${top},left=${left}`,
  );

  // Puts focus on the newWindow
  if (window.focus) {
    newWindow.focus();
  }

  return newWindow;
};
