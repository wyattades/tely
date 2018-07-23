import React from 'react';

import { roleClick, timeAgo } from '../utils';
import services from '../services';
import { SpotifyPlayer } from '../spotify_player';
import * as db from '../db';
import { userAvatar } from '../discord';


const MediaContent = ({
  link, released, media_id, image, title, service, label, mediaBottom, mediaRight, ...body
}) => <>
  <article className="media">
    <div className="media-left">
      <figure className="image media-image">
        {/* TODO: use abstracted renderer */}
        { service.ID === 'spotify_music'
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
          { released ? <small>Released {new Date(released).toLocaleDateString()}</small> : null }
          <br/>
          {service.renderBody(body)}
        </p>
      </div>
      {mediaBottom}
    </div>
    { mediaRight ? (
      <div className="media-right">
        {mediaRight}
      </div>
    ) : null}
  </article>
</>;
MediaContent.shouldComponentUpdate = () => false;

export class ListItem extends React.Component {

  state = {
    favorite: false,
  }

  shouldComponentUpdate(_, nextState) {
    return this.state.favorite !== nextState.favorite;
  }

  delete = () => {
    const { listRef, item } = this.props;
    listRef.doc(item.id).delete();
  };

  favorite = () => {
    this.setState({ favorite: 'loading' });
    db.createFavorite(this.props.type)
    .then((listRef) => listRef.collection('contents').add(this.props.item))
    .then(() => this.setState({ favorite: true }))
    .catch(console.error);
  };

  share = () => {
    window.navigator.share({
      title: `Checkout some ${this.props.label} from Tely`,
      text: '',
      url: this.props.item.link || window.location.href,
    })
    .then(() => console.log('Successfully shared'))
    .catch((error) => console.error('Error sharing:', error));
  }

  render() {
    const { item, canWrite, type, className } = this.props;
    const { favorite } = this.state;

    const userId = db.getProfile() && db.getProfile().id;

    const levelBottom = (
      <nav className="level is-mobile">
        { item.creator && (
          <div className="level-left">
            <small className="has-text-grey has-text-right">
              {timeAgo(item.created)}
              { userId !== item.creator.id ? (
                <span>
                  &nbsp;by <em>{item.creator.username}</em>
                  &nbsp;<img src={userAvatar(item.creator, 20)} alt={item.creator.username} width="20"/>
                </span>
              ) : null }
            </small>
          </div>
        )}
        <div className="level-right" style={{ margin: -14 }}>
          { canWrite && <>
            <button className="button is-inverted is-link" onClick={this.delete} title="Delete from List">
              <span className="icon"><i className="fas fa-trash"/></span>
            </button>
            <button className={`button is-inverted ${favorite === true ? 'is-success' : 'is-link'}`}
              onClick={this.favorite} title="Add to Favorites" disabled={favorite}>
              <span className="icon"><i className="fas fa-heart"/></span>
            </button>
          </> }
          { (window.navigator && window.navigator.share) ? (
            <button className="button is-inverted is-link" onClick={this.share} title="Share">
              <span className="icon"><i className="fas fa-share-alt"/></span>
            </button>
          ) : null }
        </div>
      </nav>
    );

    return (
      <div className={`box ${className}`}>
        <MediaContent {...item} service={services.asObject[type]} mediaBottom={levelBottom}/>
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
    const { hovered } = this.state;

    let addIcon;
    if (canWrite) {
      if (item.id) addIcon = (
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
    } else if (item.id) {
      addIcon = (
        <a className="icon has-text-success is-unclickable">
          <i className="fas fa-check"/>
        </a>
      );
    }

    return (
      <MediaContent {...item} service={services.asObject[type]} mediaRight={addIcon}/>
    );
  }
}
