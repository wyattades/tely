import React from 'react';

import { roleClick } from '../../utils';
import * as discord from '../../discord';
import * as share from '../../share';
import MultiInput from '../MultiInput';
import { Spinner } from '../misc';

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

class SharedItem extends React.Component {

  state = {
    waiting: false,
  }

  onClick = () => {
    const { guild: { id }, listId, shared } = this.props;

    this.setState({ waiting: true });

    share.setPermissionMembers(id, listId, !shared)
    .then(() => this.setState({ waiting: false }))
    .catch((err) => console.error(err) || this.setState({ waiting: false }));
  }
  
  render() {
    const { guild: { id, icon, name, canWrite }, shared } = this.props;

    return (
      <div key={id} className="buttons">
        <div className="button is-discord is-fullwidth
          space-between is-medium has-text-left is-unclickable">
          { icon && (
            <img style={{ marginRight: 16 }} src={`${ICON_URL}/${id}/${icon}.png`}
              alt={name} className="image is-48x48 is-rounded"/>
          )}
          <span className="is-clipped" style={{ flex: 1 }}>{name}{canWrite ? ' canWrite' : ''}</span>
          <button className={`button is-medium is-discordmain is-marginless ${this.state.waiting ? 'is-loading' : ''}`}
            disabled={this.state.waiting} onClick={this.onClick}>
            {shared ? 'Unshare' : 'Share'}
          </button>
        </div>
      </div>
    );
  }
}

export default class Share extends React.Component {

  state = {
    showGuilds: false,
    // showFriends: false,
    guilds: null,
    sharedUsers: null,
    sharedGuilds: null,
    error: null,
  }

  componentDidMount() {
    discord.getGuilds()
    .then((guilds) => {
      this.guilds = guilds;
      this.filterGuilds(this.props.metaData.shared_servers);
    })
    .catch((error) => this.setState({ error }));

    this.unsubscribe = share.getListSharedUsers(this.props.meta.id, (sharedUsers) => {
      this.setState({ sharedUsers });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!sameSet(nextProps.metaData.shared_servers, this.props.metaData.shared_servers)) {
      this.filterGuilds(nextProps.metaData.shared_servers);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  filterGuilds = (permissions = {}) => {
    const guilds = [],
          sharedGuilds = [];
    for (const guild of this.guilds) {
      const guildPermission = permissions[guild.id];
      if (guildPermission) {
        guild.canWrite = guildPermission.can_write;
        sharedGuilds.push(guild);
      } else guilds.push(guild);
    }
    this.setState({
      guilds,
      sharedGuilds,
    });
  }

  toggleShowGuilds = () => this.setState(({ showGuilds }) => ({
    showGuilds: !showGuilds,
  }));

  show = (state, toggle) => () => this.setState({
    [state]: toggle,
  });

  togglePublic = (e) => {
    this.props.meta.update({
      is_public: e.target.checked,
    })
    .catch(console.error);
  };

  sharedItem = (shared) => (guild) => (
    <SharedItem key={guild.id} shared={shared} listId={this.props.meta.id} guild={guild}/>
  )

  shareUser = (id) => share.setPermission(id, this.props.meta.id, true);
  unshareUser = (id) => share.setPermission(id, this.props.meta.id, false);

  render() {
    const { showGuilds, guilds, sharedGuilds, error, sharedUsers } = this.state;
    const { metaData: { name, is_public } } = this.props;

    return <>
      <p className="is-size-5 has-text-grey">Share:</p>
      <h1 className="is-size-1">{name}</h1>
      <br/>
      <p className="content">
        Tely was built to create collaborative lists between friends.
        You can make this list public or share it with an entire discord server,
        specific users, or no one at all!
      </p>
      <label className="checkbox is-size-4" htmlFor="public">
        <input id="public" type="checkbox" onChange={this.togglePublic} defaultChecked={is_public}/>
        &nbsp;Make this list public?
      </label>
      <p>Everyone in the world could see it</p>
      <br/>
      <h4 className="is-size-4 has-text-centered">Share with Discord Users</h4>
      <br/>
      { sharedUsers
        ? <MultiInput items={sharedUsers} onAddItem={this.shareUser} onRemoveItem={this.unshareUser}/>
        : <Spinner centered/>
      }
      <p className="help">
        A user's ID can be retrieved by right clicking his
        or her icon and clicking <code>Copy ID</code>
      </p>
      <br/>
      <h2 className="has-text-centered is-size-4">Share with Discord Servers</h2>
      <br/>
      <p className="has-text-centered has-text-grey">Currently Shared With:</p>
      <br/>
      <div className="box">
        { sharedGuilds && (sharedGuilds.length
          ? sharedGuilds.map(this.sharedItem(true))
          : <p className="has-text-centered has-text-danger">No one!</p>) }
      </div>
      <p className="has-text-centered has-text-grey">Share:</p>
      <br/>
      { error && <p>{error}</p> }
      <div className="box is-clickable" onClick={!showGuilds ? this.show('showGuilds', true) : null}>
        <p className="space-between">
          <span>{ !showGuilds && 'Show guilds' }</span>
          <i className={`${showGuilds ? 'delete' : 'dropdown-icon'}`}
            onClick={showGuilds ? this.show('showGuilds', false) : null}
            role="button" tabIndex="0" onKeyPress={roleClick}/>
        </p>
        { showGuilds && guilds && <><br/>{guilds.length
          ? guilds.map(this.sharedItem(false))
          : <p className="has-text-danger has-text-centered">No guilds</p>
        }</> }
      </div>
    </>;
  }
}
