import React from 'react';
import { Link } from 'react-router-dom';
import { SmallSection, Spinner } from './misc';

import * as db from '../db';

const ListView = ({ id, type, name }) => (
  <div key={id} className="buttons">
    <Link to={`/list/${id}`} className="button multiline space-between
    has-text-left is-large is-fullwidth">
      <span>
        <p className="is-size-4">{name}</p>
        <p className="help">{type}</p>
      </span>
      <span className="icon"><i className="fa fa-tv"/></span>
    </Link>
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

    let Content;
    if (this.state.lists) {
      if (this.state.lists.length) {
        Content = <ul>{this.state.lists.map(ListView)}</ul>;
      } else {
        Content = <p>No Lists!</p>;
      }
    } else {
      Content = <Spinner/>;
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
            <Link to="/list/new" className="button is-success">
              <span className="icon is-small is-left">
                <i className="fas fa-plus"/>
              </span>
              <span>Create New List</span>
            </Link>
          </div>
        </div>
        { this.state.err &&
          <div className="has-text-error">{this.state.err}</div>
        }
        <hr/>
        {Content}
      </SmallSection>
    );
  }
}

export default MediaLists;
