import React from 'react';

import * as db from '../db';
import { profiles, clearProfile } from '../api';
import { SmallSection } from './misc';

const AVATAR_URL = 'https://cdn.discordapp.com/avatars';

const deleteAll = () => {
  const afirm = window.confirm('Are your sure? This will delete all of your lists permanently.');
  if (afirm) window.alert('Too bad it\'s not implemeneted yet');
};

export default () => {
  const { discord, spotify } = profiles;
  const user = db.getUser();

  return (
    <SmallSection>
      <h1 className="is-size-1">Account</h1>
      <br/>
      {/* <label className="label">Avatar</label> */}
      { discord.avatar && (
        <p>
          <img className="image" alt={discord.username}
            src={`${AVATAR_URL}/${discord.id}/${discord.avatar}.png`}/>
        </p>
      )}
      <br/>
      <p className="label">Discord Profile</p>
      <pre>
        Username: {discord.username}#{discord.discriminator}<br/>
        { discord.email && <>Email: {discord.email}<br/></> }
        Id: {discord.id}
      </pre>
      <br/>
      <p className="label">Connected Accounts</p>
      { spotify ? (
        <div className="notification is-success space-between">
          <div>
            <strong>Spotify</strong>
            <p>{spotify.username}</p>
          </div>
          <button className="button" onClick={() => clearProfile('spotify')}>Disconnect</button>
        </div>
      ) : <p>None</p>}
      <br/>
      <p className="label">Account Created</p>
      <p>{new Date(user.metadata.creationTime).toLocaleString()}</p>
      <br/>
      <button className="button is-danger" onClick={deleteAll}>Delete Everything</button>
    </SmallSection>
  );
};
