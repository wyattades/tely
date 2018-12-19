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

const RESULT_COUNT = 21;

class Browse extends React.Component {

  state = {
    lists: null,
    error: null,
  }

  componentDidMount() {
    this.fetchLists(this.props);

    window.addEventListener('scroll', this.onScroll);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.filter !== nextProps.filter || this.props.sort !== nextProps.sort) {
      this.lastDoc = null;
      this.setState({ lists: null, error: null }, () => this.fetchLists(nextProps));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  containerRef = React.createRef();

  fetchLists({ sort, filter }) {

    let query = db.lists.limit(RESULT_COUNT).where('is_public', '==', true);

    if (filter) query = query.where('type', '==', filter);

    if (sort === 'new') query = query.orderBy('created');
    else if (sort === 'modified') query = query.orderBy('modified', 'desc');
    else query = query.orderBy('popularity', 'desc');

    const lastDoc = this.lastDoc;
    this.lastDoc = null;

    if (lastDoc) query = query.startAfter(lastDoc);
    
    query.get()
    .then((snap) => {
      
      const lists = [];
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
      });

      if (lastDoc && this.state.lists)
        this.setState((prevState) => ({
          lists: prevState.lists.concat(lists),
        }));
      else
        this.setState({ lists });

      this.lastDoc = lists.length >= RESULT_COUNT ? snap.docs[snap.docs.length - 1] : null;

      this.onScroll();
    })
    .catch((error) => console.error(error) || this.setState({ error: error.code }));
  }

  onScroll = () => {
    if (this.lastDoc && this.containerRef.current
        && this.containerRef.current.getBoundingClientRect().bottom < window.innerHeight) {
      this.fetchLists(this.props);
    }
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
      const len = lists.length;
      amount = (
        <p className="has-text-grey">
          {len || 'No'} Result{len === 1 ? '' : 's'}{len < RESULT_COUNT ? ' Found' : ' Shown'}
        </p>
      );
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
          <div className="columns is-multiline" ref={this.containerRef}>
            {lists.map(_ListView)}
          </div>
        ) : <><br/><br/><br/><Spinner centered/></> }
      </ContainerSection>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(Browse);
