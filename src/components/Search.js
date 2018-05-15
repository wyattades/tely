import React from 'react';

import services from '../services';

class TruncateText extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      truncated: props.text.length > props.maxLength,
    };
  }

  open = () => this.setState({
    truncated: false,
  })
  
  render() {
    if (this.state.truncated) {
      return (
        <span>
          {this.props.text.substring(0, this.props.maxLength - 3)}...
          <br/>
          <a onClick={this.open}>Show More</a>
        </span>
      );
    } else {
      return this.props.text;
    }
  }
}

TruncateText.defaultProps = {
  maxLength: 200,
};

export class SearchItem extends React.Component {

  state = {
    hovered: false,
  }

  render() {
    const { item, toggle } = this.props;
    const { id, title, desc, image, released, type, link } = item;
    const { hovered } = this.state;

    const hover = (val) => () => this.setState({
      hovered: val,
    });

    return (
      <article className="media">
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
              <a href={link}><strong>{title}</strong></a>&nbsp;
              <small>{released}</small>&nbsp;
              <strong><small>{type}</small></strong>
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
          {!id ? (
            <a className="icon" onClick={toggle}>
              <i className="fas fa-plus"/>
            </a>
          ) : (
            <a className={`icon has-text-${hovered ? 'danger' : 'success'}`}
              onMouseEnter={hover(true)} onMouseLeave={hover(false)}
              onClick={toggle}>
              <i className={`fas ${hovered ? 'fa-times' : 'fa-check'}`}/>
            </a>
          )}
        </div>
      </article>
    );
  }
}

export class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      resultCount: null,
      searching: false,
      searchQuery: '',
    };
    this.media = services.asObject[props.type];
  }

  SEARCH_DELAY = 1000;

  search = () => {
    const str = this.state.searchQuery;
    if (str) {
      this.setState({
        searching: true,
        resultCount: null,
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

    this.setState({ searchQuery });

    if (this.searchDelayTimer)
      window.clearTimeout(this.searchDelayTimer);

    this.searchDelayTimer = window.setTimeout(
      this.search.bind(this, searchQuery),
      this.SEARCH_DELAY,
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.searchDelayTimer)
      window.clearInterval(this.searchDelayTimer);

    this.search(this.state.searchQuery);
  }

  clearSearch = () => {
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
      <span className="icon is-large is-right icon-clickable" onClick={this.clearSearch}>
        <i className="fas fa-times-circle"/>
      </span>
    );

    return <>
      <form onSubmit={this.handleSubmit}>
        <div className="field has-addons">
          <div className="control has-icons-right is-expanded">
            <input className={`input is-large ${resultCount === 0 && 'is-danger'}`} value={searchQuery}
              type="text" onChange={this.handleChange}
              placeholder={`Add ${this.media.LABEL}`}/>
            {Side}
          </div>
          <div className="control">
            <button type="submit" className="button is-info is-large">Search</button>
          </div>
        </div>
      </form>
      <br/>
      { resultCount !== null && <p className="has-text-grey has-text-centered">{resultCount} Results</p> }
    </>;
  }
}
