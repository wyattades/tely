import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const App = () => <div>Hello World!</div>;

export default hot(module)(App);
