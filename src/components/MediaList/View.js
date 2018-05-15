import React from 'react';

import ListItem from '../ListItem';
import { Search, SearchItem } from '../Search';

export default ({ meta, contents, searchResults, list, onSearch }) => {

  let Content = null;
  if (searchResults) {
    const toggle = (item) => () => {
      if (item.id) return contents.doc(item.id).delete()
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

    Content = searchResults.map((item) => <SearchItem item={item} key={item.media_id} toggle={toggle(item)}/>);
  } else if (list.length) {
    Content = list.map((item) => <ListItem {...item} key={item.id} listRef={contents}/>);
  } else {
    Content = <p className="is-size-4 has-text-centered">Empty List!</p>;
  }

  return <>
    <p className="is-size-5 has-text-grey">Your List:</p>
    <h1 className="is-size-1">{meta.name}</h1>
    <br/>
    <Search type={meta.type} setResults={onSearch}/>
    <br/>
    <div>
      {Content}
    </div>
  </>;
};
