import React from 'react';
import { NavLink } from 'react-router-dom';

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

    // TODO don't display settings and share pages if not owner
    // const isOwner = metaData

    if (err) throw err;

    if (!meta || !list) {
      return <Spinner fullPage/>;
    } else {
      const prev = this.props.match.url;

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
                  <NavLink exact to={`/list/${this.listid}/share`}>
                    <span className="icon"><i className="fa fa-share-alt"/></span> Share
                  </NavLink>
                </li>
                <li>
                  <NavLink exact to={`/list/${this.listid}/suggest`}>
                    <span className="icon"><i className="fa fa-gift"/></span> Suggested
                  </NavLink>
                </li>
                <li>
                  <NavLink exact to={`/list/${this.listid}/settings`}>
                    <span className="icon"><i className="fa fa-cog"/></span> Settings
                  </NavLink>
                </li>
              </ul>
            </section>
          </aside>
          <div className="column is-offset-3">
            <section className="section">
              <LiveSwitch location={this.props.location} match={this.props.match} routes={[
                { exact: true, path: prev, element: <ListView searchResults={searchResults}
                  meta={meta} contents={this.contents} list={list} id={this.listid} onSearch={this.onSearch}/> },
                { exact: true, path: `${prev}/share`, element: <ListShare metaData={meta} meta={this.meta}/> },
                { exact: true, path: `${prev}/suggest`, element: <ListSuggest meta={meta}/> },
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
