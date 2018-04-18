import React from 'react';

import { encodeQuery } from '../utils';
import * as db from '../db';

const MOVIEDB_API_KEY = 'e516ac54480a35fac52c1c9c8af54200';
const MOVIEDB_API_URL = 'https://api.themoviedb.org/3/search';

/*
"poster_sizes": [
  "w92",
  "w154",
  "w185",
  "w342",
  "w500",
  "w780",
  "original"
],
*/

const TruncateText = ({ text }) => {
  if (text.length > 150) {
    return (
      <span>{text.substring(0, 150)}...<br/><a href="#">Show More</a></span>
    );
  } else {
    return text;
  }
};

class MoviesTV {
  IMAGE_SRC = 'https://image.tmdb.org/t/p/w92';
  MEDIA_URL = 'https://tmdb.org';

  label = 'Movie or TV Show';

  search = (str, page = 1) => {
    const query = encodeQuery({
      api_key: MOVIEDB_API_KEY,
      query: encodeURIComponent(str).replace(/%20/g, '+'),
      page,
      include_adult: false,
      language: 'en-US',
    });

    const fetchMovies = fetch(`${MOVIEDB_API_URL}/movie?${query}`)
    .then((res) => res.json())
    .then((res) => res.results.map(({ id, title, poster_path, overview, release_date }) => ({
      type: 'Movie',
      title,
      image: poster_path && `${this.IMAGE_SRC}/${poster_path}`,
      desc: overview,
      id,
      link: `${this.MEDIA_URL}/movie/${id}`,
      released: release_date,
    })));

    const fetchTV = fetch(`${MOVIEDB_API_URL}/tv?${query}`)
    .then((res) => res.json())
    .then((res) => res.results.map(({ id, name, poster_path, overview, first_air_date }) => ({
      type: 'TV',
      title: name,
      image: poster_path && `${this.IMAGE_SRC}/${poster_path}`,
      desc: overview,
      id,
      link: `${this.MEDIA_URL}/tv/${id}`,
      released: first_air_date,
    })));

    return Promise.all([ fetchMovies, fetchTV ])
    .then(([ l1, l2 ]) => l1.concat(l2));
  }

  renderItem = ({ id, title, desc, image, released, type, link }) => (
    <article className="media" key={id}>
      <figure className="media-left">
        <p className="image is-3by4">
          { image &&
            <img src={image} alt={title}/>
          }
        </p>
      </figure>
      <div className="media-content">
        <div className="content">
          <p>
            <a href={link}><strong>{title}</strong></a> <small>{released}</small> <strong><small>{type}</small></strong>
            <br/>
            <TruncateText text={desc}/>
          </p>
        </div>
        {/* <nav className="level is-mobile">
          <div className="level-left">
            <a className="level-item">
              <span className="icon is-small"><i className="fas fa-plus" /></span>
            </a>
            <a className="level-item">
              <span className="icon is-small"><i className="fas fa-retweet" /></span>
            </a>
            <a className="level-item">
              <span className="icon is-small"><i className="fas fa-heart" /></span>
            </a>
          </div>
        </nav> */}
      </div>
      <div className="media-right">
        <a className="icon" onClick={() => this.addItem(id)}>
          <i className="fas fa-plus"/>
        </a>
      </div>
    </article>
  );
}

class SpotifyMusic {
  label = 'Spotify Song';

  search = () => {
    throw 'Not implemented';
  }

  renderItem = () => (
    null
  );
}

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searching: false,
      results: null,
      searchQuery: '',
    };

    switch (props.type) {
      case 'spotify-music': this.media = new SpotifyMusic(); break;
      case 'movies-tv': default: this.media = new MoviesTV(); break;
    }

    this.media.addItem = (id) => {
      console.log('addItem', id, props.type);
      // props.listRef.add();
    };
  }

  search = () => {
    const str = this.state.searchQuery;
    if (str) {
      this.setState({
        searching: true,
      }, () => {
        this.media.search(str)
        .then((results) => this.setState({
          results,
          searching: false,
        }))
        .catch(console.error);
      });
    } else {
      this.setState({ results: null });
    }
  }

  handleChange = (event) => {
    const searchQuery = event.target.value;

    this.setState({ searchQuery });

    if (this.searchDelayTimer)
      window.clearTimeout(this.searchDelayTimer);

    this.searchDelayTimer = window.setTimeout(
      this.search.bind(this, searchQuery),
      this.props.searchDelay,
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.searchDelayTimer)
      window.clearInterval(this.searchDelayTimer);

    this.search(this.state.searchQuery);
  }

  clearSearch = () => this.setState({
    searchQuery: '',
    results: null,
  })

  render() {
    const { results, searchQuery, searching } = this.state;

    let Results = null;
    if (results) {
      Results = (
        <div>
          {results.length === 0 ? (
            <p className="no-results">No results!</p>
          ) : results.map(this.media.renderItem)}
        </div>
      );
    }

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div className="field has-addons">
            <div className="control has-icons-right is-expanded">
              <input className="input is-large" value={searchQuery}
                type="text" onChange={this.handleChange}
                placeholder={`Add a ${this.media.label}`}/>
              { searching ? (
                <span className="icon is-large is-right">
                  <i className="fas fa-circle-notch fa-spin"/>
                </span>
              ) : (results && (
                <span className="icon is-large is-right icon-clickable" onClick={this.clearSearch}>
                  <i className="fas fa-times-circle"/>
                </span>
              ))}
            </div>
            <div className="control">
              <button type="submit" className="button is-info is-large">Search</button>
            </div>
          </div>
        </form>
        { Results }
      </div>
    );
  }
}

Search.defaultProps = {
  searchDelay: 1000,
  type: 'movies-tv',
};

export default Search;
