import React from 'react';
import { Link, useHistory } from 'react-router-dom';

import * as db from '../db';
import { useAuthUser } from '../hooks';

const Home = () => {
  const history = useHistory();

  const authUser = useAuthUser();
  const username = authUser && db.getProfile()?.username;

  const signIn = () => {
    db.signIn()
      .then((path) => history.push(path))
      .catch(console.error);
  };

  return (
    <section className="hero is-fullheight-flex">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h2 className="site-title" style={{ fontSize: 120 }}>
            Tely
          </h2>
          <h5 className="is-size-5">
            Create and share lists of media with your Discord pals!
          </h5>
          <br />
          <button className="button is-medium is-discord" onClick={signIn}>
            SIGN IN WITH DISCORD
          </button>
        </div>
      </div>
      <div className="hero-footer">
        {username ? (
          <div className="container has-text-centered">
            <Link className="button" to="/list">
              Continue as {username}
            </Link>
            <br />
            <br />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Home;
