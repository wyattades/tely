import React from 'react';

import * as db from '../db';
import { profiles, clearProfile } from '../api';
import { SmallSection } from './misc';

const AVATAR_URL = 'https://cdn.discordapp.com/avatars';

const deleteAll = () => {
  // const userId = db.getProfile().id;

  const afirm = window.confirm('Are your sure? This will delete all of your lists permanently.');
  if (afirm) window.alert('Too bad it\'s not implemeneted yet');

  // db.lists.where('owner', '==', userId).get()
  // .then((snap) => Promise.all(snap.docs.map((doc) => db.lists.doc(doc.id).delete())))
  // .then(() => db.users.doc(userId).delete())
  // .then(db.signOut)
  // .then(() => {
  //   window.location.href = '/tely';
  //   alert('Successfully deleted profile. Goodbye!');
  // })
  // .catch(() => alert('An error occurred while deleting profile'));
};

export default class Account extends React.Component {

  state = {
    spotify: !!profiles.spotify,
  }

  disconnect = (service) => {
    clearProfile(service);
    this.setState({ [service]: false });
  }

  render() {
    const { discord } = profiles;
    const { spotify } = this.state;
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
              <p>{profiles.spotify.username}</p>
            </div>
            <button className="button" onClick={() => this.disconnect('spotify')}>Disconnect</button>
          </div>
        ) : <p>None</p>}
        <br/>
        <p className="label">Account Created</p>
        <p>{new Date(user.metadata.creationTime).toLocaleString()}</p>
        <br/>
        <button className="button is-danger" onClick={deleteAll}>Delete Everything</button>
      </SmallSection>
    );
  }
}
