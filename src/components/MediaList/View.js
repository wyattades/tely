import React from 'react';

import ListItem from '../ListItem';
import { Search, SearchItem } from '../Search';

export default ({ meta, contents, searchResults, list, onSearch }) => {

  let grid = false;

  let Content = null;
  if (searchResults) {
    const toggle = (item) => () => {
      if (item.id) return contents.doc(item.id).delete()
      .then(() => {
        item.id = null;
        onSearch([ ...searchResults ]);
      });
      else {
        item.created = Date.now();
        return contents.add(item)
        .then((snap) => {
          item.id = snap.id;
          onSearch([ ...searchResults ]);
        });
      }
    };

    Content = searchResults.map((item) => <SearchItem item={item} key={item.media_id} toggle={toggle(item)}/>);
  } else if (list.length) {
    // grid = true;
    Content = list.map((item) => (
      <ListItem {...item} key={item.id} className={grid && "column is-4"} listRef={contents}/>
    ));
  } else {
    Content = <p className="is-size-4 has-text-centered">Empty List!</p>;
  }

  return <>
    <p className="is-size-5 has-text-grey">Your List:</p>
    <h1 className="is-size-1">{meta.name}</h1>
    <br/>
    <Search type={meta.type} setResults={onSearch}/>
    <br/>
    {/* <div className="field has-addons">
      <div className="control">
        <button className="button is-dark">
          <span className="icon">
            <i className="fas fa-th-list fa-lg"/>
          </span>
        </button>
      </div>
      <div className="control">
        <button className="button">
          <span className="icon">
            <i className="fas fa-th-large"/>
          </span>
        </button>
      </div>
    </div> */}
    <div className={grid ? 'columns is-multiline' : ''}>
      {Content}
    </div>
  </>;
};
