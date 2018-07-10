import React from 'react';
import { Link } from 'react-router-dom';
import { SmallSection, Spinner } from './misc';
import services from '../services';

import * as db from '../db';
import { getSharedLists } from '../share';

export const ListView = ({ id, type, name }) => {

  const service = services.asObject[type];
  if (!service) return <p>[Invalid List]</p>;

  return (
    <Link to={`/list/${id}`} className="button space-between
      has-text-left is-large is-fullwidth" title={name}>
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
      this.listMap = {};
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
        this.listMap[item.id] = true;
      });
      this.setState({ lists });
    }, (err) => this.setState({ err: err.code }));

    this.unsubscribeShared = getSharedLists((sharedLists) => {
      this.setState({
        sharedLists: this.listMap ? sharedLists.filter((list) => !(list.id in this.listMap)) : sharedLists,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.unsubscribeShared();
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
      <SmallSection>
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
          <div className="has-text-danger">Error: {this.state.err}</div>
        )}
        <hr/>
        {MyLists}
        <br/>
        <h1 className="is-size-1">Shared With You</h1>
        <hr/>
        {SharedLists}
        <br/><br/><br/>
      </SmallSection>
    );
  }
}

export default MediaLists;
