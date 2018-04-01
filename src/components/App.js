import React from 'react';
import { hot } from 'react-hot-loader';
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Switch,
} from 'react-router-dom';

import Home from './Home';
import NoMatch from './NoMatch';
import MediaList from './MediaList';
import NewMediaList from './NewMediaList';
import Header from './Header';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };
  }

  render() {
    return this.state.loading ? null : (
      <Router>
        <div>
          <Header/>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/list/new" component={NewMediaList}/>
            <Route exact path="/list/:listid" component={MediaList}/>
            <Route component={NoMatch}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default hot(module)(App);
