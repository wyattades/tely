import React from 'react';

import { SearchItem } from '../Search';
import services from '../../services';

export default class Suggest extends React.Component {

  state = {
    suggested: null,
    err: null,
  }

  componentWillMount() {
    this.fetchSuggested();
  }

  onToggle = (item) => () => {
    const { contents } = this.props;

    if (item.id) return contents.doc(item.id).delete()
    .then(() => {
      item.id = null;
      // Rerender suggested
      this.setState(({ suggested }) => ({ suggested: [ ...suggested ] }));
    });
    else {
      item.created = Date.now();
      return contents.add(item)
      .then((snap) => {
        item.id = snap.id;
        this.setState(({ suggested }) => ({ suggested: [ ...suggested ] }));
      });
    }
  };

  fetchSuggested = () => {
    services.asObject[this.props.meta.type].suggest(this.props.list)
    .then((suggested) => this.setState({ suggested }))
    .catch((err) => console.error(err) || this.setState({ err: 502 }));
  }

  render() {
    const { meta } = this.props;
    const { suggested, err } = this.state;

    let Content = null;
    if (err) Content = <p className="has-text-danger has-text-centered">An error occurred while fetching content</p>;
    else if (suggested) {
      if (suggested.length) Content = suggested.map((item) => (
        <SearchItem item={item} key={item.media_id} toggle={this.onToggle(item)}/>
      ));
      else Content = <p className="has-text-centered">No Suggestions at this Time!</p>;
    }

    return <>
      <p className="is-size-5 has-text-grey">Suggested:</p>
      <h1 className="is-size-1">{meta.name}</h1>
      <br/>
      <center>
        <button className="button is-info is-medium" onClick={this.fetchSuggested}>
          <span className="icon"><i className="fas fa-sync-alt"/></span>
          <span>Refresh Suggestions</span>
        </button>
      </center>
      <br/><br/>
      {Content}
    </>;
  }
}
