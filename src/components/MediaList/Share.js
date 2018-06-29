import React from 'react';

import * as discord from '../../discord';
import * as db from '../../db';

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
    showGuilds: false,
    showFriends: false,
    guilds: null,
    sharedGuilds: null,
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

  filterGuilds = (share) => {
    const guilds = [],
          sharedGuilds = [];
    for (const guild of this.guilds) {
      if (guild.id in share) sharedGuilds.push(guild);
      else guilds.push(guild);
    }
    this.setState({
      guilds,
      sharedGuilds,
    });
    // this.setState({
    //   guilds: this.guilds.filter((guild) => !(guild.id in share)),
    // });
  }

  toggleShowGuilds = () => this.setState({
    showGuilds: !this.state.showGuilds,
  });

  show = (state, toggle) => () => this.setState({
    [state]: toggle,
  });

  togglePublic = (e) => {
    this.props.meta.update({
      is_public: e.target.checked,
    })
    .catch(console.error);
  };

  share = (id, meta) => () => {

    const guildRef = db.sharedGuilds.doc(id);

    // if (guildRef.isEqual(db.Firestore.Values.Empty))
    // guildRef.get((snap) => {
    //   snap.
    // });
    guildRef.set({
      meta,
      shared: {
        [this.props.meta.id]: true,
      },
    }, { merge: true });

    this.props.meta.update({
      [`share.${id}`]: true,
    });

    // db.sharedGuilds.doc(`${id}/shared/${this.props.meta.id}`).set(true);

    // discord.getGuildMembers(id)
    // .then((members) => members.map((memberId) => db.users
    // .doc(memberId).collection('permissions').update({ [id]: true })))
    // .then(Promise.all)
    // .then(() => console.log('success!'))
    // .catch(console.error);
  };

  unshare = (id) => () => {
    this.props.meta.update({
      [`share.${id}`]: db.Helpers.FieldValue.delete(),
    });
    // .catch(console.error);
    // db.sharedGuilds.doc(id).collection('shared').doc(this.props.meta.id).delete();
    db.sharedGuilds.doc(`${id}/shared/${this.props.meta.id}`).delete();
  };

  render() {
    const { showGuilds, showFriends, guilds, sharedGuilds, friends, error } = this.state;
    const { metaData: { name, share, is_public, owner } } = this.props;

    return <>
      <p className="is-size-5 has-text-grey">Share:</p>
      <h1 className="is-size-1">{name}</h1>
      <br/>
      <p className="content">
        Tely was built to create collaborative lists between friends.
        You can make this list public or share it with an entire discord server,
        specific users, or no one at all!
      </p>
      <label className="checkbox is-size-4">
        <input type="checkbox" onChange={this.togglePublic} defaultChecked={is_public}/>
        &nbsp;Make this list public?
      </label>
      <p>Everyone in the world could see it</p>
      {!is_public && <>
        <br/>
        <h2 className="has-text-centered is-size-4">Currently shared with:</h2>
        <br/>
        <div className="box">
          { sharedGuilds && (sharedGuilds.length ?
            sharedGuilds.map(SharedItem(true, this.unshare)) :
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
      </>}
    </>;
  }
}
