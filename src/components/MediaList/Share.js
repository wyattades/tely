import React from 'react';

import { roleClick, sameSet } from '../../utils';
import * as discord from '../../discord';
import * as share from '../../share';
import MultiInput from '../form/MultiInput';

class SharedItem extends React.Component {
  state = {
    waiting: false,
  };

  onClick = () => {
    const { guild, metaData, shared } = this.props;

    this.setState({ waiting: true });

    share[shared ? 'unshareServer' : 'shareServer'](
      guild.id,
      metaData,
      true,
    ).catch((err) => console.error(err) || this.setState({ waiting: false }));
  };

  render() {
    const {
      guild: { id, icon, name },
      shared,
    } = this.props;

    return (
      <div key={id} className="buttons">
        <div
          className="button is-discord is-fullwidth
          space-between is-medium has-text-left is-unclickable"
        >
          {icon && (
            <img
              style={{ marginRight: 16 }}
              src={discord.serverIcon(id, icon)}
              alt={name}
              className="image is-48x48 is-rounded"
            />
          )}
          <span className="is-clipped" style={{ flex: 1 }}>
            {name}
          </span>
          <button
            className={`button is-medium is-discordmain is-marginless ${
              this.state.waiting ? 'is-loading' : ''
            }`}
            disabled={this.state.waiting}
            onClick={this.onClick}
          >
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
  };

  componentDidMount() {
    discord
      .getGuilds()
      .then((guilds) => {
        this.guilds = guilds;
        this.filterGuilds(this.props.metaData.shared_servers);
      })
      .catch((error) => this.setState({ error }));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      !sameSet(
        nextProps.metaData.shared_servers,
        this.props.metaData.shared_servers,
      )
    ) {
      this.filterGuilds(nextProps.metaData.shared_servers);
    }
  }

  filterGuilds = (sharedServers = {}) => {
    const guilds = [],
      sharedGuilds = [];

    if (!this.guilds) return;

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
  };

  toggleShowGuilds = () =>
    this.setState(({ showGuilds }) => ({
      showGuilds: !showGuilds,
    }));

  show = (state, toggle) => () =>
    this.setState({
      [state]: toggle,
    });

  togglePublic = () => {
    this.props.meta
      .update({
        is_public: !this.props.metaData.is_public,
      })
      .catch(console.error);
  };

  sharedItem = (shared) => (guild) => (
    <SharedItem
      key={guild.id}
      shared={shared}
      metaData={this.props.metaData}
      guild={guild}
    />
  );

  shareUser = (id) => share.shareUser(id, this.props.metaData, true);
  unshareUser = (id) => share.unshareUser(id, this.props.metaData, true);

  render() {
    const { showGuilds, guilds, sharedGuilds, error } = this.state;
    const {
      metaData: { name, is_public, shared_users },
    } = this.props;

    const errorMsg = error && typeof error === 'object' && error.msg;

    return (
      <>
        <p className="is-size-5 has-text-grey">Share:</p>
        <h1 className="is-size-1 is-clipped">{name}</h1>
        <br />
        <p className="content">
          Tely was built to create collaborative lists between friends. You can
          make this list public or share it with an entire discord server,
          specific users, or no one at all!
        </p>
        <hr />
        <h4 className="is-size-3">Readers</h4>
        <p className="has-text-grey">
          Publish this list to make it readable by anyone. It will show up on
          the <em>Browse</em> page
        </p>
        <br />
        <button
          className={`button is-medium ${
            is_public ? 'is-danger' : 'is-success'
          }`}
          onClick={this.togglePublic}
        >
          {is_public ? 'Unpublish' : 'Publish'}
        </button>
        <hr />
        <h4 className="is-size-3">Collaborators</h4>
        <p className="has-text-grey">
          Let individual users or entire Discord servers edit this list
        </p>
        <br />
        <label className="label">Users</label>
        <MultiInput
          items={shared_users ? Object.keys(shared_users) : []}
          placeholder="User ID"
          minLength={6}
          maxLength={20}
          type="number"
          onAddItem={this.shareUser}
          onRemoveItem={this.unshareUser}
        />
        <p className="help">
          A user&rsquo;s ID can be retrieved by right-clicking their Discord
          icon and clicking <code>Copy ID</code>
        </p>
        <br />
        <label className="label">Servers</label>
        {error && (
          <p className="has-text-danger">
            {errorMsg || 'An unknown error occurred'}
          </p>
        )}
        <div className="box">
          {sharedGuilds &&
            (sharedGuilds.length ? (
              sharedGuilds.map(this.sharedItem(true))
            ) : (
              <p className="has-text-centered has-text-grey">
                Not shared with any servers!
              </p>
            ))}
        </div>
        <div
          className="box is-clickable"
          onClick={!showGuilds ? this.show('showGuilds', true) : null}
        >
          <p className="space-between">
            <span>{!showGuilds && 'Show servers'}</span>
            <i
              className={`${showGuilds ? 'delete' : 'dropdown-icon'}`}
              onClick={showGuilds ? this.show('showGuilds', false) : null}
              role="button"
              tabIndex="0"
              onKeyPress={roleClick}
            />
          </p>
          {showGuilds && guilds && (
            <>
              <br />
              {guilds.length ? (
                guilds.map(this.sharedItem(false))
              ) : (
                <p className="has-text-danger has-text-centered">No guilds</p>
              )}
            </>
          )}
        </div>
      </>
    );
  }
}
