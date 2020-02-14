import React from 'react';
import { Link } from 'react-router-dom';

import { SmallSection, Spinner } from './misc';
import { servicesMap } from '../services';
import { getSharedLists } from '../share';

export const ListView = ({ id, type, name }) => {
  const service = servicesMap[type];
  if (!service) return <p>[Invalid List]</p>;

  return (
    <Link
      to={`/list/${id}`}
      className="button space-between
      has-text-left is-large is-fullwidth"
      title={name}
    >
      <div style={{ minWidth: 0 }}>
        <p className="is-size-4 is-clipped">{name}</p>
        <p className="help">{service.LABEL}</p>
      </div>
      <div className="icon">
        <i className={`fa fa-${service && service.ICON}`} />
      </div>
    </Link>
  );
};

const _ListView = (props) => (
  <div key={props.id} className="buttons">
    <ListView {...props} />
  </div>
);

class MediaLists extends React.Component {
  state = {
    lists: null,
    sharedLists: null,
    error: null,
  };

  componentDidMount() {
    this.unsubscribe = getSharedLists((error, lists, sharedLists) =>
      this.setState({ error, lists, sharedLists }),
    );
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { error, lists, sharedLists } = this.state;

    if (error) throw error;

    let MyLists;
    if (!lists) {
      MyLists = <Spinner centered />;
    } else if (lists.length) {
      MyLists = <ul>{lists.map(_ListView)}</ul>;
    } else {
      MyLists = <p className="has-text-centered">No Lists!</p>;
    }

    let SharedLists;
    if (!sharedLists) {
      SharedLists = <Spinner centered />;
    } else if (sharedLists.length) {
      SharedLists = <ul>{sharedLists.map(_ListView)}</ul>;
    } else {
      SharedLists = <p className="has-text-centered">No Shared Lists!</p>;
    }

    return (
      <SmallSection>
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h1 className="is-size-1">Your Lists</h1>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <Link to="/list/new" className="button is-primary">
                <span className="icon is-small is-left">
                  <i className="fas fa-plus" />
                </span>
                <span>Create New List</span>
              </Link>
            </div>
          </div>
        </div>
        <hr />
        {MyLists}
        <br />
        <h1 className="is-size-1">Shared With You</h1>
        <hr />
        {SharedLists}
        <br />
        <br />
        <br />
      </SmallSection>
    );
  }
}

export default MediaLists;
