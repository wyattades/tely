import React from 'react';
import { Link } from 'react-router-dom';

import * as db from '../db';

export default ({ history }) => {
  const signIn = () => db.signIn()
  .then(() => history.push('/list/new'))
  .catch((err) => console.error(err));

  return (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h3 className="title is-1">Tely</h3>
          <button className="button is-medium is-discord" onClick={signIn}>SIGN IN WITH DISCORD</button>
        </div>
      </div>
      <div className="hero-footer">
        {db.getUser() && (
          <div className="container has-text-centered">
            <Link className="button" to="/list/new">Continue as {db.getProfile().username}</Link>
            <br/><br/>
          </div>
        )}
      </div>
    </section>
  );
};
