import React from 'react';

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
const playTrack = (id, play = true) => {
  if (loaded)
    return (!profiles.spotify ? signIn('spotify') : Promise.resolve())
    .then(() => !profiles.spotify.accessToken ? refreshToken('spotify') : Promise.resolve())
    .then(() => !player ? loadPlayer() : Promise.resolve())
    .then(() => playerId ? api(`/me/player/${play ? 'play' : 'pause'}?device_id=${playerId}`, 'PUT', play && {
      uris: [ `spotify:track:${id}` ],
    }) : Promise.reject('No playerId'))
  return Promise.reject('Not loaded');
};

export class SpotifyPlayer extends React.Component {

  state = {
    playing: false,
    error: false,
  }

  componentWillUnmount() {
    if (this.listener) {
      player.removeListener('player_state_changed', this.onStateChange);

      if (this.state.playing) playTrack(this.props.id, false).catch(() => {});
    }
  }

  onStateChange = ({ paused, track_window }) => this.setState({
    playing: !paused && this.props.id === track_window.current_track.id,
  });

  onClick = () => {
    if (!this.state.playing)
      playTrack(this.props.id)
      .then(() => {
        if (!this.listener) {
          this.listener = true;
          player.addListener('player_state_changed', this.onStateChange);
        }
      })
      .catch((err) => {
        console.error('playTrack', err);
        this.setState({ error: true });
        setTimeout(() => this.setState({ error: false }), 1000);
      });
    else
      playTrack(this.props.id, false)
      .catch((err) => {
        console.error('pauseTrack', err);
        this.setState({ error: true });
        setTimeout(() => this.setState({ error: false }), 1000);
      });
  }

  render() {
    const { playing, error } = this.state;

    return (
      <a className={`play-button ${playing ? 'playing' : ''} ${error ? 'error' : ''}`}
        onClick={this.onClick} title={playing ? 'Pause' : 'Play'}>
        <svg version="1.1"
          xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px" y="0px" width="100%" height="100%" viewBox="0 0 213.7 213.7"
          enableBackground="new 0 0 213.7 213.7" xmlSpace="preserve">
          <polygon points="73.5,62.5 148.5,105.8 73.5,149.1 "/>
          <circle cx="106.8" cy="106.8" r="103.3"/>
        </svg>
      </a>
    );
  }
}
