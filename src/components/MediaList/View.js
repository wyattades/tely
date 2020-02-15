import React from 'react';

import { ListItem, SearchItem } from '../ListItem';
import Search from '../Search';
import * as share from '../../share';
import * as db from '../../db';

export default class View extends React.Component {
  UNSAFE_componentWillMount() {
    this.canWrite = share.canWrite(this.props.meta);
  }

  toggleSearchItem = (item) => {
    const { contents, meta } = this.props;

    db.toggleListItem(item, contents, meta).then((newItem) => {
      const { searchResults, onSearch } = this.props;
      onSearch(
        searchResults.map((_item) =>
          _item.media_id === newItem.media_id ? newItem : _item,
        ),
      );
    });
  };

  toggleListItem = (item) => {
    const { contents } = this.props;

    db.toggleListItem(item, contents, null, false);
  };

  render() {
    const { meta, searchResults, list, onSearch } = this.props;

    const loggedIn = db.isLoggedIn();

    const grid = false;

    let Content = null;
    if (searchResults) {
      Content = searchResults.map((item) => (
        <SearchItem
          key={item.media_id}
          item={item}
          canWrite={this.canWrite}
          toggle={this.toggleSearchItem}
        />
      ));
    } else if (list.length) {
      // grid = true;
      Content = list.map((item) => (
        <ListItem
          key={item.id}
          item={item}
          className={grid && 'column is-4'}
          toggle={this.toggleListItem}
          canDelete={this.canWrite}
          showLabels={loggedIn}
          listId={meta.id}
        />
      ));
    } else {
      Content = <p className="is-size-4 has-text-centered">Empty List!</p>;
    }

    return (
      <>
        <p className="is-size-5 has-text-grey">Your List:</p>
        <h1 className="is-size-1 is-clipped">{meta.name}</h1>
        <br />
        <Search type={meta.type} setResults={onSearch} />
        <br />
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
        <div className={grid ? 'columns is-multiline' : ''}>{Content}</div>
      </>
    );
  }
}
