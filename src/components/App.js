import React from 'react';
import { hot } from 'react-hot-loader';
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
import { Spinner } from './misc';

import * as db from '../db';


if (process.env.NODE_ENV === 'development') window.db = db;

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

class App extends React.Component {

  state = {
    mounted: false,
  }

  componentDidMount() {
    db.init()
    .then(() => this.setState({ mounted: true }));
  }

  render() {

    if (!this.state.mounted) return <Spinner fullPage/>;

    return (
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
          </>
        </RouterToUrlQuery>
      </Router>
    );
  }
}

export default hot(module)(App);
