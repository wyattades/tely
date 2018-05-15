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
  <Route {...rest} render={(props) =>
    db.getUser() ? <>
      <Header/>
      <Component {...props}/>
    </> : (
      <Redirect to={{
        pathname: '/',
        state: { from: props.location },
      }}/>
    )
  }/>
);

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  render() {
    return this.state.loading ? null : (
      <Router basename="/tely">
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/about" component={About}/>
            <Route exact path="/browse" render={() => { throw { code: 501 }; }}/>
            <PrivateRoute exact path="/account" component={Account}/>
            <PrivateRoute exact path="/list" component={MediaLists}/>
            <PrivateRoute exact path="/list/new" component={NewMediaList}/>
            <PrivateRoute path="/list/:listid" component={MediaList}/>
            <Route render={() => { throw { code: 404 }; }}/>
          </Switch>
        </ErrorBoundary>
      </Router>
    );
  }
}

export default hot(module)(App);
