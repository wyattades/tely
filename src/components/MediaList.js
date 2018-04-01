import React from 'react';

import * as db from '../db';
import { spinner } from './misc';
import ListItem from './ListItem';

class MediaList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    db.fetchList(this.props.match.params.listid)
    .then((list) => {
      this.setState({ list, loading: false });
    })
    .catch(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    if (this.state.loading) {
      return spinner;
    } else if (this.state.list) {
      return [
        <h2>List</h2>,
        <ul>
          {this.state.list.map(ListItem)}
        </ul>,
      ];
    } else {
      return (
        <div>Sorry, this list does not exist or you do not have access</div>
      );
    }
  }
}

export default MediaList;
