import React from 'react';
import { Link } from 'react-router-dom';

import { ContainerSection } from './misc';
import * as db from '../db';
import services from '../services';

const ListView = ({ id, type, name }) => {

  const service = services.asObject[type];

  return (
    <div key={id} className="column is-one-third">
      <Link to={`/list/${id}`} className="button multiline space-between
      has-text-left is-large is-fullwidth">
        <span>
          <p className="is-size-4">{name}</p>
          <p className="help">{service.LABEL}</p>
        </span>
        <span className="icon"><i className={`fa fa-${service && service.ICON}`}/></span>
      </Link>
    </div>
  );
};

export default class Browse extends React.Component {

  state = {
    lists: null,
    error: null,
  }

  componentDidMount() {
    // TODO: implement sort-by and filter-by-type
    this.unsubscribe = db.lists.where('is_public', '==', true)
    .onSnapshot((snap) => {
      let lists = [];
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
      });
      this.setState({ lists });
    }, (error) => console.error(error) || this.setState({ error: error.code }));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { lists, error } = this.state;

    let amount = null;
    if (lists) {
      if (lists.length === 0) amount = 'No Public Lists';
      else if (lists.length === 1) amount = '1 Public List';
      else amount = `${lists.length} Public Lists`;
    }

    return (
      <ContainerSection>
        <h1 className="is-size-1">Browse</h1>
        <p className="is-size-5 has-text-grey">Public Lists</p>
        <br/>
        { error && <p className="has-text-danger">{error}</p>}
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <p className="has-text-grey">{amount}</p>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <div className="field has-addons">
                <div className="control">
                  <a className="button is-static">Filter by</a>
                </div>
                <div className="control">
                  <div className="select">
                    <select>
                      <option>-</option>
                      <option>Spotify Music</option>
                      <option>Music & TV</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="level-item">
              <div className="field has-addons">
                <div className="control">
                  <a className="button is-static">Sort by</a>
                </div>
                <div className="control">
                  <div className="select">
                    <select>
                      <option>Newest</option>
                      <option>Popularity</option>
                      <option>Last Modified</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="columns is-multiline">
          { lists && lists.length && lists.map(ListView) }
        </div>
      </ContainerSection>
    );
  }
}
