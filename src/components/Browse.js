import React from 'react';

import { ContainerSection } from './misc';
import * as db from '../db';

const ListItem = ({ id, name }) => (
  <div key={id}>{name}</div>
);

export default class Browse extends React.Component {

  state = {
    lists: null,
    error: null,
  }

  componentDidMount() {
    db.lists.where('visibility', '==', 'public').get()
    .then((snap) => {
      const lists = [];
      snap.forEach((item) => {
        const itemData = item.data();
        itemData.id = item.id;
        lists.push(itemData);
      });
      this.setState({ lists });
    })
    .catch((error) => this.setState({
      error,
    }));
  }

  render() {
    const { lists, error } = this.state;

    return (
      <ContainerSection>
        <h1 className="is-size-1">Browse</h1>
        <div>
          { error && <p className="has-text-danger">{error}</p>}
          { lists && (lists.length ? lists.map(ListItem) : <p>No Public Lists</p>) }
        </div>
      </ContainerSection>
    );
  }
}
