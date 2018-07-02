// import React from 'react';

import { signIn, apiFactory, profiles, refreshToken } from './api';

const API_URL = 'https://api.spotify.com/v1';
const api = apiFactory('spotify', API_URL, true);

// State of web player
let initialized = false,
    loaded = false,
    player = null,
    playerId = null;

const loadPlayer = () => new Promise((resolve, reject) => {

  player = new window.Spotify.Player({
    name: 'Tely Online Playback',
    volume: 0.7,
    getOAuthToken: cb => { cb(profiles.spotify.accessToken); },
  });

  player.addListener('initialization_error', reject);
  player.addListener('authentication_error', (err) => {
    profiles.spotify.accessToken = null; // Nullify accessToken
    reject(err);
  });
  player.addListener('account_error', reject);
  player.addListener('not_ready', reject);

  player.addListener('ready', ({ device_id }) => {
    playerId = device_id;
    console.log('Ready!');
    resolve();
  });

  // Connect to the player
  player.connect();
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
        loadPlayer().catch((err) => {
          player.disconnect();
          player = null;
          console.error(err);
        });
      }
    };
  }
};

// If not authenticated, signIn/refreshToken then load web player
export const playTrack = (id) => {
  if (loaded)
    (!profiles.spotify ? signIn('spotify') : Promise.resolve())
    .then(() => !profiles.spotify.accessToken ? refreshToken('spotify') : Promise.resolve())
    .then(() => !player ? loadPlayer() : Promise.resolve())
    .then(() => playerId ? api(`/me/player/play?device_id=${playerId}`, 'PUT', {
      uris: [ `spotify:track:${id}` ],
    }) : Promise.resolve())
    .catch(console.error);
};

// export class SpotifyPlayer extends React.Component {

//   componentWillMount() {
//     player.addListener('player_state_changed', this.onStateChange);
//   }

//   componentWillUnmount() {
//     player.removeListener('player_state_changed', this.onStateChange);
//   }

//   onStateChange = ({ paused }) => {
//     this.setState({
//       paused,
//     });
//   }

//   render() {
//     const { paused } = this.state;

//     return (
//       <div>
//         {paused}
//       </div>
//     );
//   }
// }
