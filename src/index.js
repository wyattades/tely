import { render } from 'react-dom';
import React from 'react';
import * as Offline from 'offline-plugin/runtime';

import './styles/style.scss';
import App from './components/App';


if (process.env.NODE_ENV === 'production') Offline.install();

render(<App/>, document.getElementById('root'));
