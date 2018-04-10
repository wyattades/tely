import React from 'react';

import * as db from '../db';
import { spinner } from './misc';
import ListItem from './ListItem';

class MediaList extends React.Component {

  constructor(props) {
    super(props);

    // Save firebase refs
    this.meta = db.lists.doc(props.match.params.listid);
    this.contents = this.meta.collection('contents');
    
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {    
    this.meta.get()
    .then((snap) => {
      const meta = snap.data();
      this.setState({ meta, loading: false });
    })
    .catch((err) => {
      console.error('list fetch', err);
      this.setState({ loading: false });
    });

    this.unsubscribe = this.contents.orderBy('created')
    .onSnapshot((snap) => {
      this.setState({ list: [] });

      snap.forEach((itemSnap) => {
        this.setState((prev) => {
          const itemData = itemSnap.data();
          itemData.id = itemSnap.id;
          prev.list.push(itemData);
          return prev;
        });
      });
    });
    // .catch((err) => console.error('contents', err));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  newListItem = () => {
    this.contents.add({
      name: 'random thing' + Date.now(),
      created: Date.now(),
    })
    .then(console.log)
    .catch(console.error);
  }

  render() {
    if (this.state.loading) {
      return spinner;
    } else if (Array.isArray(this.state.list)) {

      const { name } = this.state.meta;

      return (
        <div>
          <h2>List: {name}</h2>
          <button onClick={this.newListItem}>New Item</button>
          <div>
            {this.state.list.map(ListItem)}
          </div>
        </div>
      );
    } else {
      return (
        <div>Sorry, this list does not exist or you do not have access</div>
      );
    }
  }
}

export default MediaList;
