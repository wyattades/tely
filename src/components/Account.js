import React from 'react';

import * as db from '../db';
import { SmallSection } from './misc';

const AVATAR_URL = 'https://cdn.discordapp.com/avatars/';

const deleteAll = () => {
  const afirm = window.confirm('Are your sure? This will delete all of your lists permanently.');
  if (afirm) window.alert('Too bad it\'s not implemeneted yet');
};

export default () => {
  const profile = db.getProfile();
  const user = db.getUser();

  return (
    <SmallSection>
      <h1 className="is-size-1">Account</h1>
      <br/>
      {/* <label className="label">Avatar</label> */}
      { profile.avatar && (
        <p>
          <img className="image" alt={profile.username}
            src={`${AVATAR_URL}/${profile.id}/${profile.avatar}.png`}/>
        </p>
      )}
      <br/>
      <label className="label">Discord Profile</label>
      <pre>
        Username: {profile.username}#{profile.discriminator}<br/>
        { profile.email && <>Email: {profile.email}<br/></> }
        Id: {profile.id}
      </pre>
      <br/>
      <label className="label">Account Created</label>
      <p>{new Date(user.metadata.creationTime).toLocaleString()}</p>
      <br/>
      <button className="button is-danger" onClick={deleteAll}>Delete Everything</button>
    </SmallSection>
  );
};
