import React from 'react';

import * as db from '../db';
import { spinner, ContainerSection } from './misc';
import ListItem from './ListItem';
import Header from './Header';
import Search from './Search';

class MediaList extends React.Component {

  constructor(props) {
    super(props);

    // Save firebase refs
    this.meta = db.lists.doc(props.match.params.listid);
    this.contents = this.meta.collection('contents');
    
    this.state = {
      list: null,
      meta: null,
      err: null,
    };
  }

  componentDidMount() {
    this.meta.get()
    .then((snap) => {
      if (!snap.exists) throw { code: 404 };

      const meta = snap.data();
      this.setState({ meta });
    })
    .catch((err) => this.setState({ err }));

    this.unsubscribe = this.contents.orderBy('created')
    .onSnapshot((snap) => {
      const list = [];
      snap.forEach((itemSnap) => {
        const itemData = itemSnap.data();
        itemData.id = itemSnap.id;
        list.push(itemData);
      });
      this.setState({ list });
    }, (err) => this.setState({ err }));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  newListItem = () => {
    this.contents.add({
      title: 'random thing',
      author: db.getProfile().id,
      created: Date.now(),
      desc: 'here is some random text for the things',
    })
    .then(console.log)
    .catch(console.error);
  }

  render() {
    const { meta, list, err } = this.state;

    if (err) throw err;

    if (!meta || !list) {
      return spinner;
    } else {
      return [
        <Header/>,
        <ContainerSection>
          <p className="is-size-5 has-text-grey">Your List:</p>
          <h1 className="is-size-1">{meta.name}</h1>
          <Search type={meta.type}/>
          <div>
            {list.length ? list.map(ListItem) : (
              <p className="is-size-4">Empty List!</p>
            )}
          </div>
        </ContainerSection>,
      ];
    }
  }
}

export default MediaList;
