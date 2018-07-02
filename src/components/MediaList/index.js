import React from 'react';
import { NavLink } from 'react-router-dom';

import { initPlayer } from '../../spotify_player';
import * as db from '../../db';
import { Spinner, LiveSwitch } from '../misc';
import ListView from './View';
import ListSuggest from './Suggest';
import ListShare from './Share';
import ListSettings from './Settings';


class MediaList extends React.Component {

  constructor(props) {
    super(props);

    this.listid = props.match.params.listid;

    // Save firebase refs
    this.meta = db.lists.doc(this.listid);
    this.contents = this.meta.collection('contents');
    
    this.state = {
      list: null,
      meta: null,
      err: null,
    };
  }

  componentDidMount() {
    this.unsubscribeMeta = this.meta.onSnapshot((snap) => {
      if (!snap.exists) throw { code: 404 };

      const meta = snap.data();

      // Load spotify player
      if (meta.type === 'spotify_music') initPlayer();

      this.setState({ meta });
    }, (err) => this.setState({ err }));

    this.unsubscribeContent = this.contents.orderBy('created')
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
    const { meta, list, err, searchResults } = this.state;

    if (err) throw err;

    if (!meta || !list) {
      return <Spinner fullPage/>;
    } else {
      const prev = this.props.match.url;

      const isOwner = meta.owner === db.getProfile().id;

      return (
        <div className="columns">
          <aside className="column is-narrow fixed-column">
            <section className="section">
              <ul className="menu-list">
                <li>
                  <NavLink exact to={`/list/${this.listid}`}>
                    <span className="icon"><i className="fa fa-th-list"/></span> View
                  </NavLink>
                </li>
                <li>
                  <NavLink exact to={`/list/${this.listid}/suggest`}>
                    <span className="icon"><i className="fa fa-gift"/></span> Suggested&nbsp;
                  </NavLink>
                </li>
                { isOwner && <>
                  <li>
                    <NavLink exact to={`/list/${this.listid}/share`}>
                      <span className="icon"><i className="fa fa-share-alt"/></span> Share
                    </NavLink>
                  </li>
                  <li>
                    <NavLink exact to={`/list/${this.listid}/settings`}>
                      <span className="icon"><i className="fa fa-cog"/></span> Settings
                    </NavLink>
                  </li>
                </> }
              </ul>
            </section>
          </aside>
          <div className="column is-offset-3">
            <section className="section">
              <LiveSwitch location={this.props.location} match={this.props.match} routes={[
                { exact: true, path: prev, element: <ListView searchResults={searchResults}
                  meta={meta} contents={this.contents} list={list} id={this.listid} onSearch={this.onSearch}/> },
                { exact: true, path: `${prev}/share`, element: <ListShare metaData={meta} meta={this.meta}/> },
                { exact: true, path: `${prev}/suggest`, element: <ListSuggest meta={meta}
                  list={list} contents={this.contents}/> },
                { exact: true, path: `${prev}/settings`, element: <ListSettings metaData={meta}
                  meta={this.meta} history={this.props.history}/> },
              ]}/>
            </section>
          </div>
          <div className="column is-2 is-hidden-touch"/>
        </div>
      );
    }
  }
}

export default MediaList;