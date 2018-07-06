import React from 'react';

import { roleClick } from '../utils';
// import * as db from '../db';
import services from '../services';
import { SpotifyPlayer } from '../spotify_player';

export default ({ id, media_id, title, link, type, label, created, image, listRef, className, ...body }) => {
  const deleteItem = () => {
    listRef.doc(id).delete();
  };

  const favoriteItem = () => {
    // db.favoriteList.add()
    alert('TBD');
  };

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
              <a className="level-item" onClick={deleteItem} title="Delete from List"
                role="button" tabIndex="0" onKeyPress={roleClick}>
                <span className="icon is-small"><i className="fas fa-trash" /></span>
              </a>
              {/* <a className="level-item">
                <span className="icon is-small"><i className="fas fa-plus" /></span>
              </a> */}
              <a className="level-item" onClick={favoriteItem} title="Add to Favorites"
                role="button" tabIndex="0" onKeyPress={roleClick}>
                <span className="icon is-small"><i className="fas fa-heart" /></span>
              </a>
            </div>
          </nav>
        </div>
      </article>
    </div>
  );
};
