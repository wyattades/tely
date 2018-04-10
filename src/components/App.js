import React from 'react';
import { hot } from 'react-hot-loader';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import Home from './Home';
import NoMatch from './NoMatch';
import MediaLists from './MediaLists';
import MediaList from './MediaList';
import NewMediaList from './NewMediaList';
import Header from './Header';

import * as db from '../db';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props =>
    db.getUser() ? (
      <Component {...props} />
    ) : (
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
        <div>
          <Switch>
            <Route exact path="/" component={Home}/>
            <PrivateRoute exact path="/list" component={MediaLists}/>
            <PrivateRoute exact path="/list/new" component={NewMediaList}/>
            <PrivateRoute exact path="/list/:listid" component={MediaList}/>
            <Route component={NoMatch}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default hot(module)(App);
