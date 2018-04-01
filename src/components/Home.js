import React from 'react';

import * as db from '../db';

export default ({ history }) => {
  const signIn = () => db.signIn()
  .then(() => history.push('/list/new'))
  .catch((err) => console.error(err));

  return (
    <div>
      <h1 className="home-title">Tely</h1>
      <button id="google-sign-in" onClick={signIn}>SIGN IN WITH GOOGLE</button>
    </div>
  );
};
