import { render } from 'react-dom';
import React from 'react';

import './styles/style.scss';
import * as db from './db'; // Init firebase
import App from './components/App';

db.init()
.then(() => {
  render(<App/>, document.getElementById('react-root'));
});
