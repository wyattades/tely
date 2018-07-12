import React from 'react';

import { roleClick, sameSet } from '../../utils';
import * as discord from '../../discord';
import * as share from '../../share';
import MultiInput from '../MultiInput';
// import { Spinner } from '../misc';


class SharedItem extends React.Component {

  state = {
    waiting: false,
  }

  onClick = () => {
    const { guild, metaData, shared } = this.props;

    this.setState({ waiting: true });

    share[shared ? 'unshareServer' : 'shareServer'](guild.id, metaData, true)
    .then(() => this.setState({ waiting: false }))
    .catch((err) => console.error(err) || this.setState({ waiting: false }));
  }
  
  render() {
    const { guild: { id, icon, name, role }, shared } = this.props;

    return (
      <div key={id} className="buttons">
        <div className="button is-discord is-fullwidth
          space-between is-medium has-text-left is-unclickable">
          { icon && (
            <img style={{ marginRight: 16 }} src={`${discord.ICON_URL}/${id}/${icon}.png`}
              alt={name} className="image is-48x48 is-rounded"/>
          )}
          <span className="is-clipped" style={{ flex: 1 }}>{name}</span>
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
    guilds: null,
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
  }

  componentWillReceiveProps(nextProps) {
    if (!sameSet(nextProps.metaData.shared_servers, this.props.metaData.shared_servers)) {
      this.filterGuilds(nextProps.metaData.shared_servers);
    }
  }

  filterGuilds = (sharedServers = {}) => {
    const guilds = [],
          sharedGuilds = [];
    for (const guild of this.guilds) {
      const sharedServer = sharedServers[guild.id];
      if (sharedServer) {
        guild.role = sharedServer.role;
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
    <SharedItem key={guild.id} shared={shared} metaData={this.props.metaData} guild={guild}/>
  )

  shareUser = (id) => share.shareUser(id, this.props.metaData, true);
  unshareUser = (id) => share.unshareUser(id, this.props.metaData, true);

  render() {
    const { showGuilds, guilds, sharedGuilds, error } = this.state;
    const { metaData: { name, is_public, shared_users } } = this.props;

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
      {
        shared_users && (
          <MultiInput items={Object.keys(shared_users)} onAddItem={this.shareUser} onRemoveItem={this.unshareUser}
            placeholder="User ID" minLength={6} maxLength={20} type="number"/>
        )
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
