import React from 'react';

import * as db from '../db';
import { SmallSection } from './misc';

const AVATAR_URL = 'https://cdn.discordapp.com/avatars/';

const deleteAll = () => {
  const afirm = window.confirm('Are your sure? This will delete all of your lists permanently.');
  if (afirm) window.alert('Too bad it\'s not implemeneted yet');
};

export default () => {
  const user = db.getProfile();
  return (
    <SmallSection>
      <h1 className="is-size-1">Account</h1>
      <br/>
      {/* <label className="label">Avatar</label> */}
      { user.avatar && (
        <p>
          <img className="image" alt={user.username}
            src={`${AVATAR_URL}/${user.id}/${user.avatar}.png`}/>
        </p>
      )}
      <br/>
      {/* <label className="label">Discord Information</label> */}
      <pre>
        Username: {user.username}#{user.discriminator}<br/>
        { user.email && <>Email: {user.email}<br/></> }
        Id: {user.id}
      </pre>
      <br/>
      <button className="button is-danger" onClick={deleteAll}>Delete Everything</button>
    </SmallSection>
  );
};
