import React from 'react';
import { hot } from 'react-hot-loader/root';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  NavLink,
} from 'react-router-dom';
import RouterToUrlQuery from 'react-url-query/lib/react/RouterToUrlQuery';

import Home from './Home';
import About from './About';
import Browse from './Browse';
import ErrorBoundary from './ErrorBoundary';
import Account from './Account';
import MediaLists from './MediaLists';
import MediaList from './MediaList';
import NewMediaList from './NewMediaList';
import Header from './Header';
import { Labels } from './Labels';
import { SpotifyControls } from '../spotify_player';
import { Alerts } from '../alert';

import * as db from '../db';


// Set default NavLink activeClassName
NavLink.defaultProps.activeClassName = 'is-active';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => db.getUser() ? <Component {...props}/> : (
    <Redirect to={{
      pathname: '/',
      search: `?from=${encodeURIComponent(props.location.pathname)}`,
    }}/>
  )}/>
);


const App = () => (
  <Router>
    <RouterToUrlQuery>
      <>
        <Header/>
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/about" component={About}/>
            <Route exact path="/browse" component={Browse}/>
            <PrivateRoute exact path="/account" component={Account}/>
            <PrivateRoute exact path="/list" component={MediaLists}/>
            <PrivateRoute exact path="/list/new" component={NewMediaList}/>
            <PrivateRoute path="/labels" component={Labels}/>
            <Route path="/list/:listid" component={MediaList}/>
            <Route exact path="/logout" render={() => {
              db.signOut().catch(console.error);
              return <Redirect to="/"/>;
            }}/>
            <Route render={() => { throw { code: 404 }; }}/>
          </Switch>
        </ErrorBoundary>
        <SpotifyControls/>
        <Alerts/>
        <Route render={({ history }) => {
          // Auto-update service worker on route change
          history.listen(() => {
            if (window.swUpdate === true) window.location.reload();
          });
          return null;
        }}/>
      </>
    </RouterToUrlQuery>
  </Router>
);

export default hot(App);
