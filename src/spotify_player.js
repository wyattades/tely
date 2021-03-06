import React from 'react';

import {
  signIn,
  apiFactory,
  getProfile,
  refreshToken,
  expired,
  hasProfile,
} from './api';
import { alert, error } from './alert';

// Test if on mobile device
const IS_MOBILE = (() => {
  try {
    const a = navigator.userAgent || navigator.vendor || window.opera;
    return (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a,
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4),
      )
    );
  } catch (_) {
    return false;
  }
})();

const API_URL = 'https://api.spotify.com/v1';
const api = apiFactory('spotify', API_URL, true);

// State of web player
let initialized = false,
  loaded = false,
  player = null,
  playerId = null,
  initControls = null;

const loadPlayer = () =>
  new Promise((resolve, reject) => {
    player = new window.Spotify.Player({
      name: 'Tely Online Playback',
      volume: 0.7,
      getOAuthToken: (cb) => {
        cb(getProfile('spotify')?.accessToken);
      },
    });

    player.addListener('initialization_error', reject);
    player.addListener('authentication_error', reject);
    player.addListener('account_error', reject);
    player.addListener('not_ready', reject);

    player.addListener('ready', ({ device_id }) => {
      playerId = device_id;
      console.log('Initialized Spotify Web Player');
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
      if (hasProfile('spotify')) {
        (expired('spotify') ? refreshToken('spotify') : Promise.resolve())
          .then(loadPlayer)
          .catch((err) => {
            player.removeListener('player_state_changed');
            player.disconnect();
            player = null;
            console.error(err);
          });
      }
    };
  }
};

// If not authenticated, signIn/refreshToken then load web player
// TODO: is this already hand;ed by apiFactory?
const playTrack = async (id) => {
  if (!loaded) throw 'Not loaded';

  if (!hasProfile('spotify')) await signIn('spotify');

  if (expired('spotify')) await refreshToken('spotify');

  if (!player) await loadPlayer();

  if (initControls) await initControls();

  if (playerId)
    await api(`/me/player/play?device_id=${playerId}`, 'PUT', {
      uris: [`spotify:track:${id}`],
    });
  else throw 'No playerId';
};

const pausePlayer = () => {
  if (player && playerId) player.pause().catch(() => {});
};

const PlayButton = () => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    width="100%"
    height="100%"
    viewBox="0 0 213.7 213.7"
    enableBackground="new 0 0 213.7 213.7"
    xmlSpace="preserve"
  >
    <polygon points="73.5,62.5 148.5,105.8 73.5,149.1 " />
    <circle cx="106.8" cy="106.8" r="103.3" />
  </svg>
);

export class SpotifyPlayerWeb extends React.Component {
  state = {
    playing: false,
    error: false,
  };

  componentWillUnmount() {
    if (this.listener && player) {
      player.removeListener('player_state_changed', this.onStateChange);
    }
  }

  onStateChange = (playerState) => {
    if (!playerState) {
      this.setState({ error: true });
      return;
    }

    const { paused, track_window } = playerState;
    this.setState({
      playing: !paused && this.props.id === track_window.current_track.id,
    });
  };

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
    else pausePlayer();
  };

  render() {
    const { playing, error } = this.state;
    const { image, title } = this.props;

    return (
      <>
        <img src={image} alt={title} />
        <a
          className={`play-button floating ${playing ? 'playing' : ''} ${
            error ? 'error' : ''
          }`}
          onClick={this.onClick}
          title={playing ? 'Pause' : 'Play'}
        >
          <PlayButton />
        </a>
      </>
    );
  }
}

const SpotifyPlayerMobile = ({ id, image, title }) => (
  <>
    <img src={image} alt={title} />
    <a
      className="play-button floating playing"
      href={`https://open.spotify.com/track/${id}`}
      title={title}
    >
      <PlayButton />
      {/* <iframe src={`https://open.spotify.com/embed?uri=spotify:track:${id}`} width="80" height="80"
      frameBorder="0" allowTransparency allow="encrypted-media" title={title}/> */}
    </a>
  </>
);

export const SpotifyPlayer = IS_MOBILE ? SpotifyPlayerMobile : SpotifyPlayerWeb;

class SpotifyControlsWeb extends React.PureComponent {
  state = {
    error: null,
    playing: false,
    hidden: true,
    collapsed: false,
    track: null,
  };

  componentDidMount() {
    initControls = () => {
      if (!this.initialized) {
        this.initialized = true;
        player.addListener('player_state_changed', this.onStateChange);
      }
    };
  }

  componentWillUnmount() {
    if (this.listener)
      player.removeListener('player_state_changed', this.onStateChange);
  }

  onStateChange = (playerState) => {
    if (!playerState) {
      this.setState({ error: true });
      return;
    }

    if (!playerState.track_window.current_track) {
      this.setState({
        hidden: false,
        playing: false,
        track: null,
      });
      return;
    }

    const { paused, track_window } = playerState;
    const { name, album, artists, id } = track_window.current_track;
    this.setState({
      hidden: false,
      playing: !paused,
      track: {
        id,
        name: name || '---',
        link: `https://open.spotify.com/track/${id}`,
        artist: (artists && artists.length && artists[0].name) || '---',
        image:
          album && album.images && album.images.length && album.images[0].url,
      },
    });
  };

  togglePlay = () => {
    player.togglePlay().catch(console.error);
  };

  toggleCollapse = () =>
    this.setState(({ collapsed }) => ({ collapsed: !collapsed }));

  saveTrack = () => {
    api('/me/tracks', 'PUT', { ids: [this.state.track.id] })
      .then(() => alert('Saved track to your library!'))
      .catch((err) => error('Failed to save track to your library', err));
  };

  render() {
    const { playing, hidden, collapsed, track, error } = this.state;

    if (hidden) return null;

    return (
      <div className={`spotify-controls ${collapsed ? 'collapsed' : ''}`}>
        <div className="spotify-controls-body">
          <div className="spotify-controls-info">
            {track ? (
              <>
                <p title={track.name}>
                  <a href={track.link}>{track.name}</a>
                </p>
                <p title={track.artist}>
                  <small>{track.artist}</small>
                </p>
              </>
            ) : (
              '---'
            )}
          </div>
          <a
            className={`play-button ${playing ? 'playing' : ''} ${
              error ? 'error' : ''
            }`}
            onClick={this.togglePlay}
            title={playing ? 'Pause' : 'Play'}
          >
            <PlayButton />
          </a>
          <a
            onClick={this.saveTrack}
            title="Save to Spotify Library"
            className="icon"
          >
            <i className="fas fa-plus" />
          </a>
        </div>
        <button
          onClick={this.toggleCollapse}
          className="spotify-controls-collapser"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <i className="fas fa-ellipsis-v" />
        </button>
      </div>
    );
  }
}

export const SpotifyControls = IS_MOBILE ? () => null : SpotifyControlsWeb;
