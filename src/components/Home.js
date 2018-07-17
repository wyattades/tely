import React from 'react';
import { Link } from 'react-router-dom';

import * as db from '../db';

export default ({ history }) => {
  const signIn = () => db.signIn()
  .then(() => history.push('/list'))
  .catch((err) => console.error(err));

  return (
    <section className="hero is-fullheight-flex">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h2 className="title is-size-1 has-text-primary">Tely</h2>
          <h5 className="is-size-5">
            Create and share lists of media with your Discord pals!
          </h5>
          <br/>
          <button className="button is-medium is-discord" onClick={signIn}>SIGN IN WITH DISCORD</button>
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
};
