import React from 'react';

import * as discord from '../../discord';
import { Helpers } from '../../db';

const sameSet = (A, B) => {
  if (A !== B) return false;
  const keysA = Object.keys(A).sort(),
        keysB = Object.keys(B).sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return false;
  }
  return true;
};

const ICON_URL = 'https://cdn.discordapp.com/icons';

const SharedItem = (shared, onClick) => (guild) => (
  <div key={guild.id} className="buttons">
    <div className="button is-discord is-fullwidth
      space-between multiline is-medium has-text-left is-unclickable">
      { guild.icon && <img style={{ marginRight: 16 }} src={`${ICON_URL}/${guild.id}/${guild.icon}.png`}
        alt={guild.name} className="image is-48x48 is-rounded"/> }
      <span className="is-clipped" style={{ flex: 1 }}>{guild.name}</span>
      <button className="button is-medium is-discordmain is-marginless" onClick={onClick(guild.id, guild)}>
        {shared ? 'Unshare' : 'Share'}
      </button>
    </div>  
  </div>
);

export default class Share extends React.Component {

  state = {
    // searchField: '',
    showGuilds: false,
    showFriends: false,
    guilds: null,
    error: null,
  }

  componentDidMount() {
    discord.getGuilds()
    .then((guilds) => {
      this.guilds = guilds;
      this.filterGuilds(this.props.metaData.share);
    })
    .catch((error) => this.setState({ error }));
  }

  componentWillReceiveProps(nextProps) {
    if (!sameSet(nextProps.metaData.share, this.props.metaData.share)) {
      this.filterGuilds(nextProps.metaData.share);
    }
  }

  filterGuilds = (share) => this.setState({
    guilds: this.guilds.filter((guild) => !(guild.id in share)),
  });

  toggleShowGuilds = () => this.setState({
    showGuilds: !this.state.showGuilds,
  });

  show = (state, toggle) => () => this.setState({
    [state]: toggle,
  });

  // changeSearch = (e) => {
  //   this.setState({
  //     searchField: e.target.value,
  //   });
  // };

  share = (id, data) => () => {
    this.props.meta.update({
      [`share.${id}`]: data,
    })
    .catch(console.error);
  };

  unshare = (id) => () => {
    this.props.meta.update({
      [`share.${id}`]: Helpers.FieldValue.delete(),
    })
    .catch(console.error);
  };

  render() {
    const { showGuilds, showFriends, guilds, friends, error } = this.state;
    const { metaData: { name, share } } = this.props;
    const shareArray = share && Object.values(share);

    return <>
      <p className="is-size-5 has-text-grey">Share:</p>
      <h1 className="is-size-1">{name}</h1>
      <br/>
      <p className="content">
        Tely was built to create collaborative lists between friends.
        You can share this list with an entire discord server, specific
        users, or no one at all!
      </p>
      <h2 className="has-text-centered is-size-4">Currently shared with:</h2>
      <br/>
      <div className="box">
        { share && (shareArray.length ?
          shareArray.map(SharedItem(true, this.unshare)) :
          <p className="has-text-centered has-text-danger">No one!</p>) }
      </div>
      <h2 className="has-text-centered is-size-4">Share</h2>
      <br/>
      {/* <div className="field has-addons is-marginless">
        <p className="control is-expanded">
          <input type="text" className="input" value={searchField} onChange={this.changeSearch}/>
        </p>
        <div className="control">
          <button className="button is-link">Search</button>
        </div>
      </div>
      <p className="help">Search by server id, server name, username, or user id</p>
      <br/> */}
      { error && <p>{error}</p> }
      <div className="box is-clickable" onClick={!showGuilds ? this.show('showGuilds', true) : null}>
        <p className="space-between">
          <span>{ !showGuilds && 'Show guilds' }</span>
          <i className={`${showGuilds ? 'delete' : 'dropdown-icon'}`}
            onClick={showGuilds ? this.show('showGuilds', false) : null}/>
        </p>
        { showGuilds && guilds && <><br/>{guilds.length ?
          guilds.map(SharedItem(false, this.share)) :
          <p className="has-text-danger has-text-centered">No guilds</p>
        }</> }
      </div>
      <div className="box is-clickable" onClick={!showFriends ? this.show('showFriends', true) : null}>
        <p className="space-between">
          <span>{ !showFriends && 'Show friends' }</span>
          <i className={`${showFriends ? 'delete' : 'dropdown-icon'}`}
            onClick={showFriends ? this.show('showFriends', false) : null}/>
        </p>
        { showFriends && <p>TBD</p> /* friends && <><br/>{friends.map(SharedItem(false, this.share))}</> */}
      </div>
    </>;
  }
}
