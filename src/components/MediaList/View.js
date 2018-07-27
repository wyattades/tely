import React from 'react';

import { ListItem, SearchItem } from '../ListItem';
import Search from '../Search';
import * as share from '../../share';
import { toggleListItem } from '../../db';


export default class View extends React.Component {

  componentWillMount() {
    this.canWrite = share.canWrite(this.props.meta);
  }

  toggleSearchItem = (item) => {
    const { contents, meta } = this.props;

    toggleListItem(item, contents, meta)
    .then((newItem) => {
      const { searchResults, onSearch } = this.props;
      onSearch(searchResults.map((_item) => _item.media_id === newItem.media_id ? newItem : _item));
    });
  }

  toggleListItem = (item) => {
    const { contents } = this.props;

    toggleListItem(item, contents, null, false);
  }
  
  render() {
    const { meta, searchResults, list, onSearch } = this.props;

    let grid = false;

    let Content = null;
    if (searchResults) {
      Content = searchResults.map((item) => (
        <SearchItem item={item} key={item.media_id} canWrite={this.canWrite}
          toggle={this.toggleSearchItem} type={meta.type}/>
      ));
    } else if (list.length) {
      // grid = true;
      Content = list.map((item) => (
        <ListItem item={item} listMeta={meta} key={item.id} className={grid && "column is-4"}
          toggle={this.toggleListItem} canWrite={this.canWrite}/>
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
  }
}
