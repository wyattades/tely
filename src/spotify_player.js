/* global Spotify */

import React from 'react';

import { apiFactory, profiles, signIn } from './api';

const API_URL = 'https://api.spotify.com/v1';
const api = apiFactory('spotify', API_URL, true);

// State of web player
let initialized = false,
    loaded = false,
    player = null,
    playerId = null;

const loadPlayer = () => new Promise((resolve, reject) => {

  player = new Spotify.Player({
    name: 'Tely Online Playback',
    volume: 0.7,
    getOAuthToken: cb => { cb(profiles.spotify.accessToken); },
  });

  player.addListener('player_state_changed', console.log);

  player.addListener('initialization_error', reject);
  player.addListener('authentication_error', reject);
  player.addListener('account_error', reject);
  player.addListener('not_ready', reject);

  player.addListener('ready', ({ device_id }) => {
    playerId = device_id;
    console.log('Ready!');
    resolve();
  });

  // Connect to the player!
  player.connect().then((connected) => console.log('Connected =', connected));
});

export const initPlayer = () => {
  if (!initialized) {
    initialized = true;

    const sdkScript = document.createElement('script');
    sdkScript.setAttribute('src', 'https://sdk.scdn.co/spotify-player.js');
    document.head.appendChild(sdkScript);
  
    window.onSpotifyWebPlaybackSDKReady = () => {
      loaded = true;
      if (profiles.spotify) {
        loadPlayer().catch(console.error);
      }
    };
  }
};

// If not authenticated, sign in and load web player
export const playTrack = (id) => {
  if (loaded)
    (!profiles.spotify ? signIn('spotify').then(loadPlayer) : Promise.resolve())
    .then(() => playerId ? api(`/me/player/play?device_id=${playerId}`, 'PUT', {
      uris: [ `spotify:track:${id}` ],
    }) : Promise.resolve())
    .catch(console.error);
};

export class SpotifyPlayer extends React.Component {

  componentWillMount() {
    player.addListener('player_state_changed', this.onStateChange);
  }

  componentWillUnmount() {
    player.removeListener('player_state_changed', this.onStateChange);
  }

  onStateChange = ({ paused }) => {
    this.setState({
      paused,
    });
  }

  render() {
    const { paused } = this.state;

    return (
      <div>
        {paused}
      </div>
    );
  }
}
