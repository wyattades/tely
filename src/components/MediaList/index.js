import React from 'react';
import { NavLink } from 'react-router-dom';

import services from '../../services';
import * as db from '../../db';
import * as share from '../../share';
import { Spinner, LiveSwitch } from '../misc';
import ListView from './View';
import ListSuggest from './Suggest';
import ListShare from './Share';
import ListSettings from './Settings';


class MediaList extends React.Component {

  constructor(props) {
    super(props);

    this.listId = props.match.params.listid;

    // Save firebase refs
    this.listRef = db.lists.doc(this.listId);
    this.contentsRef = this.listRef.collection('contents');
    
    this.state = {
      list: null,
      meta: null,
      err: null,
      isOwner: null,
      canWrite: null,
    };
  }

  componentDidMount() {
    this.unsubscribeMeta = this.listRef
    .onSnapshot((snap) => {
      if (!snap.exists) throw { code: 404 }; // TODO: does this work?

      const meta = snap.data();
      meta.id = snap.id;

      // Call init function for this type of list
      services.asObject[meta.type].init(meta);

      this.setState({
        meta,
        canWrite: share.canWrite(meta),
        isOwner: share.isOwner(meta),
      });
    }, (err) => this.setState({ err }));

    this.unsubscribeContent = this.contentsRef
    .orderBy('created')
    .onSnapshot((snap) => {
      const list = snap.docs.map((doc) => {
        const itemData = doc.data();
        itemData.id = doc.id;
        return itemData;
      });
      this.setState({ list });
    }, (err) => this.setState({ err }));
  }

  componentWillUnmount() {
    this.unsubscribeContent();
    this.unsubscribeMeta();
  }

  onSearch = (searchResults) => {

    if (searchResults) {
      // Check is search item is in the current list
      const listMap = {};
      for (const listItem of this.state.list) listMap[listItem.media_id] = listItem;

      for (const searchItem of searchResults) {
        const listItem = listMap[searchItem.media_id];
        if (listItem) {
          searchItem.id = listItem.id;
        }
      }
    }

    this.setState({
      searchResults,
    });
  }

  render() {
    const { meta, list, err, searchResults, canWrite, isOwner } = this.state;

    if (err) throw err;

    if (!meta || !list) {
      return <Spinner fullPage/>;
    } else {
      const prev = this.props.match.url;

      return (
        <section className="section">
          <div className="container">
            <div className="columns">
              <aside className="column is-narrow fixed-column">
                <ul className="menu-list">
                  <li>
                    <NavLink exact to={`/list/${this.listId}`}>
                      <span className="icon"><i className="fa fa-th-list"/></span> <span>View</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink exact to={`/list/${this.listId}/suggest`}>
                      <span className="icon"><i className="fa fa-gift"/></span><span>Suggested</span>
                    </NavLink>
                  </li>
                  { isOwner && <>
                    <li>
                      <NavLink exact to={`/list/${this.listId}/share`}>
                        <span className="icon"><i className="fa fa-share-alt"/></span> <span>Share</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink exact to={`/list/${this.listId}/settings`}>
                        <span className="icon"><i className="fa fa-cog"/></span> <span>Settings</span>
                      </NavLink>
                    </li>
                  </> }
                </ul>
              </aside>
              <div className="column is-offset-3 is-8-desktop">
                <LiveSwitch location={this.props.location} match={this.props.match} routes={[
                  { exact: true, path: prev, element: <ListView searchResults={searchResults} canWrite={canWrite}
                    meta={meta} contents={this.contentsRef} list={list} id={this.listId} onSearch={this.onSearch}/> },
                  { exact: true, path: `${prev}/suggest`, element: <ListSuggest meta={meta}
                    list={list} contents={this.contentsRef}/> },
                  ...(isOwner ? [
                    { exact: true, path: `${prev}/share`, element: <ListShare metaData={meta}
                      meta={this.listRef} canWrite={canWrite}/> },
                    { exact: true, path: `${prev}/settings`, element: <ListSettings metaData={meta}
                      meta={this.listRef} history={this.props.history}/> },
                  ] : []),
                ]}/>
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
}

export default MediaList;
