import React from 'react';

import { roleClick } from '../utils';
// import * as db from '../db';
import services from '../services';
import { SpotifyPlayer } from '../spotify_player';

export class ListItem extends React.Component {

  shouldComponentUpdate() {
    return false;
  }

  deleteItem = () => {
    const { listRef, id } = this.props;
    listRef.doc(id).delete();
  };

  favoriteItem = () => {
    // db.favoriteList.add()
    alert('TBD');
  };

  render() {
    const { id, media_id, title, link, type, label,
      created, image, listRef, className, ...body } = this.props;

    return (
      <div className={`box ${className}`}>
        <article className="media">
          <div className="media-left">
            <figure className="image media-image">
              {/* TODO: use abstracted renderer */}
              { type === 'spotify_music'
                ? <SpotifyPlayer id={media_id} image={image} title={title}/>
                : (image && <img src={image} alt={title}/>)
              }
            </figure>
          </div>
          <div className="media-content">
            <div className="content">
              <p>
                <strong><a href={link}>{title}</a></strong>&nbsp;
                <strong><small>{label}</small></strong>&nbsp;
                <small>Added {new Date(created).toLocaleDateString()}</small>
                <br/>
                {services.asObject[type].renderBody(body)}
              </p>
            </div>
            <nav className="level is-mobile">
              <div className="level-left">
                <a className="level-item" onClick={this.deleteItem} title="Delete from List"
                  role="button" tabIndex="0" onKeyPress={roleClick}>
                  <span className="icon is-small"><i className="fas fa-trash" /></span>
                </a>
                {/* <a className="level-item">
                  <span className="icon is-small"><i className="fas fa-plus" /></span>
                </a> */}
                <a className="level-item" onClick={this.favoriteItem} title="Add to Favorites"
                  role="button" tabIndex="0" onKeyPress={roleClick}>
                  <span className="icon is-small"><i className="fas fa-heart" /></span>
                </a>
              </div>
            </nav>
          </div>
        </article>
      </div>
    );
  }
}

export class SearchItem extends React.PureComponent {

  state = {
    hovered: false,
  }

  hoverEnter = () => this.setState({ hovered: true });
  hoverLeave = () => this.setState({ hovered: false });

  render() {
    const { item, toggle, type } = this.props;
    const { id, title, image, released, label, link, media_id, ...body } = item;
    const { hovered } = this.state;

    return (
      <article className="media">
        <div className="media-left">
          <figure className="image media-image">
            {/* TODO: use abstracted renderer */}
            { type === 'spotify_music'
              ? <SpotifyPlayer id={media_id} image={image} title={title}/>
              : (image && <img src={image} alt={title}/>)
            }
          </figure>
        </div>
        <div className="media-content">
          <div className="content">
            <p>
              <a href={link}><strong>{title}</strong></a>&nbsp;
              <strong><small>{label}</small></strong>&nbsp;
              <small>{released && `Released ${new Date(released).toLocaleDateString()}`}</small>
              <br/>
              {services.asObject[type].renderBody(body)}
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
            <a className="icon" onClick={toggle} role="button" tabIndex="0" onKeyPress={roleClick}>
              <i className="fas fa-plus"/>
            </a>
          ) : (
            <a className={`icon has-text-${hovered ? 'danger' : 'success'}`}
              onMouseEnter={this.hoverEnter} onMouseLeave={this.hoverLeave}
              onClick={toggle} role="button" tabIndex="0" onKeyPress={roleClick}>
              <i className={`fas ${hovered ? 'fa-times' : 'fa-check'}`}/>
            </a>
          )}
        </div>
      </article>
    );
  }
}
