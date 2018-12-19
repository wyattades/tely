import React from 'react';
import { Link } from 'react-router-dom';

import * as db from '../db';

export default class Home extends React.PureComponent {

  signIn = () => {
    db.signIn()
    .then((path) => this.props.history.push(path))
    .catch(console.error);
  }

  render() {
    return (
      <section className="hero is-fullheight-flex">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h2 className="site-title" style={{ fontSize: 120 }}>Tely</h2>
            <h5 className="is-size-5">
              Create and share lists of media with your Discord pals!
            </h5>
            <br/>
            <button className="button is-medium is-discord" onClick={this.signIn}>SIGN IN WITH DISCORD</button>
          </div>
        </div>
        <div className="hero-footer">
          {db.getProfile() && (
            <div className="container has-text-centered">
              <Link className="button" to="/list">Continue as {db.getProfile().username}</Link>
              <br/><br/>
            </div>
          )}
        </div>
      </section>
    );
  }
}
