import React from 'react';

import * as db from '../db';
import { profiles, clearProfile } from '../api';
import { SmallSection } from './misc';


const AVATAR_URL = 'https://cdn.discordapp.com/avatars';

export default class Account extends React.Component {

  state = {
    spotify: !!profiles.spotify,
  }

  disconnect = (service) => () => {
    clearProfile(service);
    this.setState({ [service]: false });
  }

  deleteAll = () => {
    if (!window.confirm('Are your sure? This will delete all of your lists permanently.')) return;
  
    db.deleteAll()
    .then(() => {
      this.props.history.push('/logout');
      window.alert('Successfully deleted profile. Goodbye!');
    })
    .catch((err) => {
      console.error(err);
      window.alert('An error occurred while deleting profile');
    });
  };

  render() {
    const { discord } = profiles;
    const { spotify } = this.state;
    const user = db.getUser();
    
    return (
      <SmallSection>
        <h1 className="is-size-1">Account</h1>
        <br/>
        { discord.avatar && (
          <p>
            <img className="image" alt={discord.username} width="128" height="128"
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
        <p className="label">Connected Services</p>
        { spotify ? (
          <div className="notification is-success space-between">
            <div>
              <strong>Spotify</strong>
              <p>{profiles.spotify.username}</p>
            </div>
            <button className="button is-success is-outlined is-inverted"
              onClick={this.disconnect('spotify')}>
              Disconnect
            </button>
          </div>
        ) : <><p>None</p><br/></> }
        <p className="label">Account Created</p>
        <p>{new Date(user.metadata.creationTime).toLocaleString()}</p>
        <br/>
        <button className="button is-danger" onClick={this.deleteAll}>Delete Everything</button>
      </SmallSection>
    );
  }
}
