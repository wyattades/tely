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
    this.unsubscribe = db.lists.where('is_public', '==', true)
    .onSnapshot((snap) => {
      let lists = [];
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
      });
      this.setState({ lists });
    }, (error) => this.setState({ error }));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { lists, error } = this.state;

    return (
      <ContainerSection>
        <h1 className="is-size-1">Browse</h1>
        <p className="is-size-5 has-text-grey">Public Lists</p>
        <br/>
        { error && <p className="has-text-danger">{error}</p>}
        <div className="columns is-multiline">
          { lists && (lists.length ? lists.map(ListView) : <p>No Public Lists</p>) }
        </div>
      </ContainerSection>
    );
  }
}
