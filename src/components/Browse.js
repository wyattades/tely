import React from 'react';
import addUrlProps from 'react-url-query/lib/react/addUrlProps';

import { ContainerSection, Spinner } from './misc';
import * as db from '../db';
import { ListView } from './MediaLists';
import services from '../services';

const _ListView = (props) => (
  <div key={props.id} className="column is-one-third">
    <ListView {...props}/>
  </div>
);

const urlPropsQueryConfig = {
  sort: {},
  filter: {},
};

class Browse extends React.Component {

  state = {
    lists: null,
    error: null,
  }

  componentDidMount() {
    this.fetchLists(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filter !== nextProps.filter || this.props.sort !== nextProps.sort)
      this.fetchLists(nextProps);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  fetchLists = ({ sort, filter }) => {
    if (this.unsubscribe) this.unsubscribe();

    let query = db.lists.where('is_public', '==', true);

    if (filter) query = query.where('type', '==', filter);

    if (sort === 'new') query = query.orderBy('created');
    else if (sort === 'modified') query = query.orderBy('modified');
    else query = query.orderBy('popularity', 'desc');

    this.unsubscribe = query
    .onSnapshot((snap) => {
      const lists = [];
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
      });
      this.setState({ lists });
    }, (error) => console.error(error) || this.setState({ error: error.code }));
  }

  changeFilter = (e) => this.props.onChangeFilter(e.target.value);

  changeSort = (e) => this.props.onChangeSort(e.target.value);

  render() {
    const { lists, error } = this.state;
    const { sort, filter } = this.props;

    let amount = null;
    if (error) {
      amount = <p className="has-text-danger">Error: {error}</p>;
    } else if (lists) {
      if (lists.length === 0) amount = 'No Results Found';
      else if (lists.length === 1) amount = '1 Result Found';
      else amount = `${lists.length} Results Found`;
      
      amount = <p className="has-text-grey">{amount}</p>;
    }

    return (
      <ContainerSection>
        <h1 className="is-size-1">Browse</h1>
        <p className="is-size-5 has-text-grey">Public Lists</p>
        <br/>
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              {amount}
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
                    <select value={filter || ''} onChange={this.changeFilter}>
                      <option value="">-</option>
                      {services.asArray.map(({ ID, LABEL }) => (
                        <option key={ID} value={ID}>{LABEL}</option>
                      ))}
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
                    <select value={sort || ''} onChange={this.changeSort}>
                      <option value="">Popularity</option>
                      <option value="new">Newest</option>
                      <option value="modified">Last Modified</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        { lists ? (
          <div className="columns is-multiline">
            {lists.map(_ListView)}
          </div>
        ) : <><br/><br/><br/><Spinner centered/></> }
      </ContainerSection>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(Browse);
