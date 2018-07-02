import React from 'react';
import { hot } from 'react-hot-loader';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  NavLink,
} from 'react-router-dom';

import Home from './Home';
import About from './About';
import Browse from './Browse';
import ErrorBoundary from './ErrorBoundary';
import Account from './Account';
import MediaLists from './MediaLists';
import MediaList from './MediaList';
import NewMediaList from './NewMediaList';
import Header from './Header';

import * as db from '../db';

// Set default NavLink activeClassName
NavLink.defaultProps.activeClassName = 'is-active';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => db.getUser() ? <Component {...props}/> : (
    <Redirect to={{
      pathname: '/',
      state: { from: props.location },
    }}/>
  )}/>
);

// eslint-disable-next-line react/prefer-stateless-function
class App extends React.Component {
  render() {
    return (
      <Router basename="/tely">
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
              <Route path="/list/:listid" component={MediaList}/>
              <Route render={() => { throw { code: 404 }; }}/>
            </Switch>
          </ErrorBoundary>
        </>
      </Router>
    );
  }
}

export default hot(module)(App);
