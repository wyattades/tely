import React from 'react';

import NavLink from '../NavLink';
import { servicesMap } from '../../services';
import * as db from '../../db';
import * as share from '../../share';
import { Spinner, LiveSwitch } from '../misc';
import ListView from './View';
import ListSuggest from './Suggest';
import ListShare from './Share';
import ListSettings from './Settings';

import './styles.scss';

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
      labels: null,
      err: null,
      isOwner: null,
      canWrite: null,
    };
  }

  setPageClass(toggle) {
    document.documentElement.classList.toggle('has-bottom-navbar', toggle);
  }

  componentDidMount() {
    this.setPageClass(true);

    this.unsubscribeMeta = this.listRef.onSnapshot(
      (snap) => {
        const meta = snap.data();
        meta.id = snap.id;

        // Call init function for this type of list
        servicesMap[meta.type].init(meta);

        this.setState({
          meta,
          canWrite: share.canWrite(meta),
          isOwner: share.isOwner(meta),
        });
      },
      (err) => this.setState({ err }),
    );

    this.unsubscribeContent = this.contentsRef.orderBy('created').onSnapshot(
      (snap) => {
        const list = snap.docs.map((doc) => {
          const itemData = doc.data();
          itemData.id = doc.id;
          return itemData;
        });
        this.setState({ list }, () => this.applyLabels());
      },
      (err) => this.setState({ err }),
    );

    if (db.isLoggedIn()) {
      this.unsubscribeLabels = db.getLabels((err, labels) => {
        if (err) console.error(err);
        else {
          this.setState({ labels }, () => this.applyLabels());
        }
      });

      this.unsubscribeLabelItems = db.listLabelMap(
        this.listId,
        (err, labelItemMap) => {
          if (err) console.error(err);
          else {
            this.labelItemMap = labelItemMap;
            this.applyLabels();
          }
        },
      );
    }
  }

  componentWillUnmount() {
    this.setPageClass(false);

    this.unsubscribeContent();
    this.unsubscribeMeta();
    if (this.unsubscribeLabels) this.unsubscribeLabels();
    if (this.unsubscribeLabelItems) this.unsubscribeLabelItems();
  }

  applyLabels() {
    const { labels, list } = this.state;
    if (!list || !labels || !this.labelItemMap) return;

    const labelMap = {};
    for (const label of this.state.labels) labelMap[label.id] = label;

    this.setState((oldState) => ({
      list: oldState.list.map((item) => {
        const itemLabels = this.labelItemMap[item.id];
        if (itemLabels) {
          for (const labelId in itemLabels) {
            itemLabels[labelId] = labelMap[labelId];
            // If our data is corrupted somehow and this label does not exist
            if (!itemLabels[labelId]) delete itemLabels[labelId];
          }
          item.labels = itemLabels;
        }
        return { ...item };
      }),
    }));
  }

  onSearch = (searchResults) => {
    if (searchResults) {
      // Check is search item is in the current list
      const listMap = {};
      for (const listItem of this.state.list)
        listMap[listItem.media_id] = listItem;

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
  };

  // setName = (name) => {
  //   this.listRef.update({ name })
  //   .catch(console.error);
  // }

  render() {
    const { meta, list, err, searchResults, canWrite, isOwner } = this.state;

    if (err) throw err;

    if (!meta || !list) {
      return <Spinner fullPage />;
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
                      <span className="icon">
                        <i className="fa fa-th-list" />
                      </span>{' '}
                      <span>View</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink exact to={`/list/${this.listId}/suggest`}>
                      <span className="icon">
                        <i className="fa fa-gift" />
                      </span>
                      <span>Suggested</span>
                    </NavLink>
                  </li>
                  {isOwner && (
                    <>
                      <li>
                        <NavLink exact to={`/list/${this.listId}/share`}>
                          <span className="icon">
                            <i className="fa fa-share-alt" />
                          </span>{' '}
                          <span>Share</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink exact to={`/list/${this.listId}/settings`}>
                          <span className="icon">
                            <i className="fa fa-cog" />
                          </span>{' '}
                          <span>Settings</span>
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
              </aside>
              <div className="column is-offset-3 is-8-desktop">
                {/* <LiveTextEdit onUpdate={this.setName} className="is-size-1" value={meta.name}/> */}
                <LiveSwitch
                  location={this.props.location}
                  match={this.props.match}
                  routes={[
                    {
                      exact: true,
                      path: prev,
                      element: (
                        <ListView
                          searchResults={searchResults}
                          canWrite={canWrite}
                          meta={meta}
                          contents={this.contentsRef}
                          list={list}
                          id={this.listId}
                          onSearch={this.onSearch}
                        />
                      ),
                    },
                    {
                      exact: true,
                      path: `${prev}/suggest`,
                      element: (
                        <ListSuggest
                          meta={meta}
                          list={list}
                          contents={this.contentsRef}
                        />
                      ),
                    },
                    ...(isOwner
                      ? [
                          {
                            exact: true,
                            path: `${prev}/share`,
                            element: (
                              <ListShare
                                metaData={meta}
                                meta={this.listRef}
                                canWrite={canWrite}
                              />
                            ),
                          },
                          {
                            exact: true,
                            path: `${prev}/settings`,
                            element: (
                              <ListSettings
                                metaData={meta}
                                meta={this.listRef}
                                history={this.props.history}
                              />
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
}

export default MediaList;
