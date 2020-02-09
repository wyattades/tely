import * as ReactDOM from 'react-dom';
import React from 'react';
import * as Offline from 'offline-plugin/runtime';

import './styles/style.scss';
import App from './components/App';
import * as db from './db';

if (process.env.NODE_ENV === 'development') {
  window.db = db;
} else {
  Offline.install({
    onUpdateReady: () => Offline.applyUpdate(),
    onUpdated: () => {
      window.swUpdate = true;
    },
  });
}

db.init().then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
