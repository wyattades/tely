import React from 'react';
import { Link } from 'react-router-dom';
import { ContainerSection, Spinner } from './misc';
import services from '../services';

import * as db from '../db';
import * as discord from '../discord';

export const ListView = ({ id, type, name }) => {

  const service = services.asObject[type];

  return (
    <Link to={`/list/${id}`} className="button space-between
      has-text-left is-large is-fullwidth">
      <div style={{ minWidth: 0 }}>
        <p className="is-size-4 is-clipped">{name}</p>
        <p className="help">{service.LABEL}</p>
      </div>
      <div className="icon"><i className={`fa fa-${service && service.ICON}`}/></div>
    </Link>
  );
};

const _ListView = (props) => (
  <div key={props.id} className="buttons">
    <ListView {...props}/>
  </div>
);

class MediaLists extends React.Component {

  state = {
    lists: null,
    sharedLists: null,
  }

  componentDidMount() {
    const uid = db.getUser().uid;

    this.unsubscribe = db.lists
    .where('owner', '==', uid)
    .onSnapshot((snap) => {
      const lists = [];
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
      });
      this.setState({ lists });
    }, (err) => this.setState({ err: err.code }));

    // TODO: best way to manage list access may be to use user/permissions
    discord.getGuilds()
    .then((guilds) => Promise.all(guilds.map(
      (guild) => db.sharedGuilds
      .doc(guild.id)
      .get()
      .then((guildData) => {
        if (!guildData.exists) return [];
        const getLists = [];
        for (const listId in guildData.data().shared) {
          getLists.push(db.lists.doc(listId).get());
        }
        return Promise.all(getLists);
      }),
    )))
    .then((snapArrays) => {
      const sharedLists = [];
      for (const arr of snapArrays) {
        for (const snap of arr) {
          if (snap.exists) {
            const itemData = snap.data();
            if (itemData.owner === db.getProfile().id) continue;
            itemData.id = snap.id;
            sharedLists.push(itemData);
          }
        }
      }
      
      if (!this.unmounted) this.setState({ sharedLists });
    })
    .catch((err) => this.setState({ err: err.code }));
  }

  componentWillUnmount() {
    this.unsubscribe();
    // this.unsubscribeShared();
    this.unmounted = true;
  }

  render() {

    let MyLists;
    if (this.state.lists) {
      if (this.state.lists.length) {
        MyLists = <ul>{this.state.lists.map(_ListView)}</ul>;
      } else {
        MyLists = <p className="has-text-centered">No Lists!</p>;
      }
    } else {
      MyLists = <Spinner centered/>;
    }

    let SharedLists;
    if (this.state.sharedLists) {
      if (this.state.sharedLists.length) {
        SharedLists = <ul>{this.state.sharedLists.map(_ListView)}</ul>;
      } else {
        SharedLists = <p className="has-text-centered">No Shared Lists!</p>;
      }
    } else {
      SharedLists = <Spinner centered/>;
    }

    return (
      <ContainerSection>
        <div className="columns">
          <div className="column">
            <div className="level">
              <div className="level-left">
                <div className="level-item">
                  <h1 className="is-size-1">Your Lists</h1>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <Link to="/list/new" className="button is-success">
                    <span className="icon is-small is-left">
                      <i className="fas fa-plus"/>
                    </span>
                    <span>Create New List</span>
                  </Link>
                </div>
              </div>
            </div>
            { this.state.err && (
              <div className="has-text-error">{this.state.err}</div>
            )}
            <hr/>
            {MyLists}
          </div>
          <div className="column">
            <h1 className="is-size-1">Shared With You</h1>
            <hr/>
            {SharedLists}
          </div>
        </div>
        
        <br/><br/><br/>
        
      </ContainerSection>
    );
  }
}

export default MediaLists;
