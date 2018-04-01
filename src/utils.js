
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

// Curtosy of https://stackoverflow.com/a/16861050/6656308
// Handles multiple monitors
export const popupCenter = (url, w, h) => {
  const dualScreenLeft = window.screenLeft !== undefined ?
    window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ?
    window.screenTop : window.screenY;

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
