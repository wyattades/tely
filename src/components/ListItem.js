import React from 'react';

import { roleClick } from '../utils';
import services from '../services';
import { SpotifyPlayer } from '../spotify_player';
import * as db from '../db';

export class ListItem extends React.Component {

  state = {
    favorite: false,
  }

  shouldComponentUpdate(_, nextState) {
    return this.state.favorite !== nextState.favorite;
  }

  delete = () => {
    const { listRef, id } = this.props;
    listRef.doc(id).delete();
  };

  favorite = () => {
    db.createFavorite(this.props.type)
    .then((listRef) => {
      const itemData = Object.assign({}, this.props);
      for (const key of ['listRef', 'className', 'canWrite']) delete itemData[key];

      return listRef.collection('contents').add(itemData);
    })
    .then(() => this.setState({ favorite: true }))
    .catch(console.error);
  };

  share = () => {
    window.navigator.share({
      title: `Checkout some ${this.props.label} from Tely`,
      text: '',
      url: this.props.link || window.location.href,
    })
    .then(() => console.log('Successfully shared'))
    .catch((error) => console.error('Error sharing:', error));
  }

  render() {
    const { id, media_id, title, link, type, label, canWrite,
      created, image, listRef, className, ...body } = this.props;
    const { favorite } = this.state;

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
                { canWrite && <>
                  <a className="level-item" onClick={this.delete} title="Delete from List"
                    role="button" tabIndex="0" onKeyPress={roleClick}>
                    <span className="icon is-small"><i className="fas fa-trash" /></span>
                  </a>
                  <a className={`level-item ${favorite ? 'is-unclickable' : ''}`} onClick={this.favorite}
                    role="button" tabIndex="0" onKeyPress={roleClick} title="Add to Favorites">
                    <span className={`icon is-small ${favorite ? 'has-text-success' : ''}`}>
                      <i className="fas fa-heart"/>
                    </span>
                  </a>
                </> }
                { (window.navigator && window.navigator.share) ? (
                  <a className="level-item" onClick={this.share} title="Share"
                    role="button" tabIndex="0" onKeyPress={roleClick}>
                    <span className="icon is-small"><i className="fas fa-share-alt" /></span>
                  </a>
                ) : null }
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
    const { item, toggle, type, canWrite } = this.props;
    const { id, title, image, released, label, link, media_id, ...body } = item;
    const { hovered } = this.state;

    let addIcon;
    if (canWrite) {
      if (id) addIcon = (
        <a className={`icon has-text-${hovered ? 'danger' : 'success'}`}
          onMouseEnter={this.hoverEnter} onMouseLeave={this.hoverLeave}
          onClick={toggle} role="button" tabIndex="0" onKeyPress={roleClick}>
          <i className={`fas ${hovered ? 'fa-times' : 'fa-check'}`}/>
        </a>
      );
      else addIcon = (
        <a className="icon" onClick={toggle} role="button" tabIndex="0" onKeyPress={roleClick}>
          <i className="fas fa-plus"/>
        </a>
      );
    } else if (id) {
      addIcon = (
        <a className="icon has-text-success is-unclickable">
          <i className="fas fa-check"/>
        </a>
      );
    }

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
        </div>
        <div className="media-right">
          {addIcon}
        </div>
      </article>
    );
  }
}
