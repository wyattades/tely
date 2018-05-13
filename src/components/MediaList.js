import React from 'react';

import * as db from '../db';
import { Spinner, ContainerSection } from './misc';
import ListItem from './ListItem';
import { Search, SearchItem } from './Search';
import { search } from '../services/movies_tv';

/*
<nav class="level">
  <!-- Left side -->
  <div class="level-left">
    <div class="level-item">
      <p class="subtitle is-5">
        <strong>123</strong> posts
      </p>
    </div>
    <div class="level-item">
      <div class="field has-addons">
        <p class="control">
          <input class="input" type="text" placeholder="Find a post">
        </p>
        <p class="control">
          <button class="button">
            Search
          </button>
        </p>
      </div>
    </div>
  </div>

  <!-- Right side -->
  <div class="level-right">
    <p class="level-item"><strong>All</strong></p>
    <p class="level-item"><a>Published</a></p>
    <p class="level-item"><a>Drafts</a></p>
    <p class="level-item"><a>Deleted</a></p>
    <p class="level-item"><a class="button is-success">New</a></p>
  </div>
</nav>
*/

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

  onSearch = (searchResults) => {

    if (searchResults) {
      // Check is search item is in the current list
      // TODO: optimize nested for loop
      const list = this.state.list;
      for (const searchItem of searchResults) {
        for (const listItem of list) {
          if (listItem.media_id === searchItem.media_id) {
            searchItem.id = listItem.id;
            break;
          }
        }
      }
    }

    this.setState({
      searchResults,
    });
  }

  render() {
    const { meta, list, err, searchResults } = this.state;

    let SearchResults = null;
    if (searchResults) {
      SearchResults = (
        <div>
          {searchResults.length === 0 ? (
            <p className="no-results">No results!</p>
          ) : searchResults.map((item) => {
            const toggle = () => {
              if (item.id) return this.contents.doc(item.id).delete()
              .then(() => {
                item.id = null;
                this.setState({ searchResults: [...searchResults] });
              });
              else {
                item.created = Date.now();
                return this.contents.add(item)
                .then((snap) => {
                  item.id = snap.id;
                  this.setState({ searchResults: [...searchResults] });
                });
              }
            };

            return <SearchItem item={item} key={item.media_id} toggle={toggle}/>;
          })}
        </div>
      );
    }

    if (err) throw err;

    if (!meta || !list) {
      return <Spinner fullPage/>;
    } else {
      return (
        <ContainerSection>
          <p className="is-size-5 has-text-grey">Your List:</p>
          <h1 className="is-size-1">{meta.name}</h1>
          <br/>
          <Search type={meta.type} setResults={this.onSearch}/>
          <br/>
          <div>
            {SearchResults}
          </div>
          <div>
            {list.length ? list.map((item) => <ListItem {...item} key={item.id} listRef={this.contents}/>) : (
              <p className="is-size-4 has-text-centered">Empty List!</p>
            )}
          </div>
        </ContainerSection>
      );
    }
  }
}

export default MediaList;
