import React from 'react';

import { SearchItem } from '../ListItem';
import services from '../../services';
import { Spinner } from '../misc';
import * as share from '../../share';
import { toggleListItem } from '../../db';


export default class Suggest extends React.Component {

  state = {
    suggested: null,
    err: null,
  }

  componentWillMount() {
    this.canWrite = share.canWrite(this.props.meta);
  }

  componentDidMount() {
    this.fetchSuggested();
  }

  onToggle = (item) => () => {
    toggleListItem(item, this.props.contents)
    .then(() => {
      this.setState(({ suggested }) => ({ suggested: [ ...suggested ] }));
    });
  };

  fetchSuggested = () => {
    services.asObject[this.props.meta.type].suggest(this.props.list)
    .then((suggested) => this.setState({ suggested }))
    .catch((err) => console.error(err) || this.setState({ err: true }));
  }

  render() {
    const { meta } = this.props;
    const { suggested, err } = this.state;

    let Content;
    if (err) Content = <p className="has-text-danger has-text-centered">An error occurred while fetching content</p>;
    else if (!suggested) Content = <><br/><br/><Spinner centered/></>;
    else if (suggested.length) Content = suggested.map((item) => (
      <SearchItem item={item} key={item.media_id} toggle={this.onToggle(item)}
        type={meta.type} canWrite={this.canWrite}/>
    ));
    else Content = <p className="is-size-4 has-text-centered">No Suggestions!</p>;

    return <>
      <p className="is-size-5 has-text-grey">Suggested:</p>
      <h1 className="is-size-1">{meta.name}</h1>
      <br/>
      <center>
        <button className="button is-primary is-medium" onClick={this.fetchSuggested}>
          <span className="icon"><i className="fas fa-sync-alt"/></span>
          <span>Refresh Suggestions</span>
        </button>
      </center>
      <br/><br/>
      {Content}
    </>;
  }
}
