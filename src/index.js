import * as ReactDOM from 'react-dom';
import React from 'react';
import * as Offline from 'offline-plugin/runtime';

import './styles/style.scss';
import App from './components/App';
import * as db from './db';


if (process.env.NODE_ENV === 'production') {
  Offline.install({
    onUpdateReady: () => Offline.applyUpdate(),
    onUpdated: () => { window.swUpdate = true; },
  });
} else if (process.env.NODE_ENV === 'development') {
  window.db = db;
}

db.init()
.then(() => {
  ReactDOM.render(<App/>, document.getElementById('root'));
});
