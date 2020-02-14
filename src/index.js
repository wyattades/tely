import { render } from 'react-dom';
import React from 'react';
// import * as Offline from 'offline-plugin/runtime';

import { IS_DEV_ENV } from './env';
import * as db from './db';
import App from './components/App';

import './styles/style.scss';

if (IS_DEV_ENV) {
  window.db = db;
} else {
  // Offline.install({
  //   onUpdateReady: () => Offline.applyUpdate(),
  //   onUpdated: () => {
  //     window.swUpdate = true;
  //   },
  // });
}

db.init().then(() => {
  render(<App />, document.getElementById('root'));
});
