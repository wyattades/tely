import React from 'react';

import * as db from '../db';

class Search extends React.Component {

  state = {
    results: [],
  }

  search = () => {
    const str = this.state.searchField;
    if (str) {
      this.setState({
        results: [],
      }, () => {
        db.search(this.props.type, str)
        .then((results) => {
          this.setState({
            results,
          });
        });
      });
    }
  }

  handleChange = (event) => {
    this.setState({
      searchField: event.target.value,
    });

    if (this.searchDelayTimer)
      window.clearInterval(this.searchDelayTimer);

    window.setInterval(this.search, this.props.searchDelay);
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.searchDelayTimer)
      window.clearInterval(this.searchDelayTimer);

    this.search();
  }

  renderItem = ({ id, title }) => (
    <li>
      {id}: {title}
    </li>
  );

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="searchField">
            Search:
            <input name="searchField" type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        <div>
          <ul>
            {this.state.results.map(this.renderItem)}
          </ul>
        </div>
      </div>
    );
  }
}

Search.defaultProps = {
  searchDelay: 500,
  type: 'spotify-music',
};

export default Search;
