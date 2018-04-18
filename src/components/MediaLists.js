import React from 'react';
import { Link } from 'react-router-dom';
import { SmallSection } from './misc';

import * as db from '../db';

const ListItem = ({ id, type, name }) => (
  <div key={id}>
    <Link to={`/list/${id}`} className="button">{name} - {type}</Link>
  </div>
);

class MediaLists extends React.Component {

  state = {
    lists: null,
  }

  componentDidMount() {
    this.unsubscribe = db.lists
    .where('owner', '==', db.getUser().uid)
    .onSnapshot((snap) => {
      const lists = [];
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
      });
      this.setState({ lists });
    }, (err) => {
      this.setState({ err: err.code });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (this.state.lists || this.state.err) ? (
      <SmallSection>
        <h1 className="is-size-1">Your Lists</h1>
        <div className="control has-icons-left">
          <Link to="/list/new" className="button is-success">Create a List</Link>
          <span className="icon is-small is-left">
            <i className="fas fa-plus"></i>
          </span>
        </div>
        { this.state.err &&
          <div className="has-text-error">{this.state.err}</div>
        }
        <hr/>
        <ul>
          {this.state.lists.map(ListItem)}
        </ul>
      </SmallSection>
    ) : (
      <div>Loading...</div>
    );
  }
}

export default MediaLists;
