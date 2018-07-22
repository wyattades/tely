import React from 'react';
import addUrlProps from 'react-url-query/lib/react/addUrlProps';

import { roleClick } from '../utils';
import services from '../services';

const urlPropsQueryConfig = {
  search: {},
};

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      resultCount: null,
      searching: false,
      searchQuery: props.search || '',
    };
    this.media = services.asObject[props.type];
  }

  componentDidMount() {
    if (this.state.searchQuery)
      this.search();
  }

  SEARCH_DELAY = 1000;

  search = () => {
    const str = this.state.searchQuery;
    this.props.onChangeSearch(str);
    
    if (str) {
      this.setState({
        searching: true,
      }, () => {
        this.media.search(str)
        .then((results) => {
          this.setState({
            searching: false,
            resultCount: results.length,
          });
          this.props.setResults(results.length ? results : null);
        })
        .catch(console.error);
      });
    } else {
      this.setState({
        resultCount: null,
      });
      this.props.setResults(null);
    }
  }

  handleChange = (event) => {
    const searchQuery = event.target.value;

    this.setState({ searchQuery }, () => {

      if (this.searchDelayTimer)
        window.clearTimeout(this.searchDelayTimer);

      this.searchDelayTimer = window.setTimeout(
        this.search,
        this.SEARCH_DELAY,
      );
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.searchDelayTimer)
      window.clearInterval(this.searchDelayTimer);

    this.search();
  }

  clearSearch = () => {
    this.props.onChangeSearch();

    this.setState({
      searchQuery: '',
      resultCount: null,
    });
    this.props.setResults(null);
  }

  render() {
    const { searchQuery, resultCount, searching } = this.state;

    if (!this.media) throw `Invalid list type: ${this.props.type}`;

    let Side = null;
    if (searching) Side = (
      <span className="icon is-large is-right">
        <i className="fas fa-circle-notch fa-spin"/>
      </span>
    );
    else if (resultCount !== null) Side = (
      <span className="icon is-large is-right icon-clickable" onClick={this.clearSearch}
        role="button" tabIndex="0" onKeyPress={roleClick}>
        <i className="fas fa-times-circle"/>
      </span>
    );

    return <>
      <form onSubmit={this.handleSubmit}>
        <div className="field has-addons">
          <div className="control has-icons-right is-expanded">
            <input className={`input ${resultCount === 0 && 'is-danger'}`} value={searchQuery}
              type="text" onChange={this.handleChange}
              placeholder={`Add ${this.media.LABEL}`}/>
            {Side}
          </div>
          <div className="control">
            <button type="submit" className="button is-primary">Search</button>
          </div>
        </div>
      </form>
      <br/>
      { resultCount !== null && <p className="has-text-grey has-text-centered">{resultCount} Results</p> }
    </>;
  }
}

export default addUrlProps({ urlPropsQueryConfig })(Search);
