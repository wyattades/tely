import React from 'react';

import * as db from '../db';

class MediaLists extends React.Component {

  state = {
    lists: null,
  }

  componentDidMount() {
    this.unsubscribe = db.users
    .doc(`/${db.getUser().providerId}`)
    .collection('lists')
    .onSnapshot((snap) => {
      console.log(snap);
      const lists = [];
      snap.forEach((item) => {
        lists.push(item.data());
      });
      this.setState({ lists });
    }, console.error);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return this.state.lists ? (
      <div>
        <h3>Lists</h3>
        <ul>
          {this.state.lists.map((list) => (
            <li>{list.id}</li>
          ))}
        </ul>
      </div>
    ) : (
      <div>Loading...</div>
    );
  }
}

export default MediaLists;
