import React from 'react';

import * as db from '../db';

export default ({ id, title, type, desc, created, image, listRef }) => {
  const deleteItem = () => {
    listRef.doc(id).delete();
  };

  const favoriteItem = () => {
    // db.favoriteList.add()
    alert('TBD');
  };

  return (
    <div className="box">
      <article className="media">
        <div className="media-left">
          <figure className="image is-3by4">
            <img src={image} alt="" />
          </figure>
        </div>
        <div className="media-content">
          <div className="content">
            <p>
              <strong>{title}</strong> <small><i>{type}</i></small> &nbsp;<small>{new Date(created).toLocaleDateString()}</small>
              <br />
              {desc}
            </p>
          </div>
          <nav className="level is-mobile">
            <div className="level-left">
              <a className="level-item" onClick={deleteItem} title="Delete from List">
                <span className="icon is-small"><i className="fas fa-trash" /></span>
              </a>
              {/* <a className="level-item">
                <span className="icon is-small"><i className="fas fa-plus" /></span>
              </a> */}
              <a className="level-item" onClick={favoriteItem} title="Add to Favorites">
                <span className="icon is-small"><i className="fas fa-heart" /></span>
              </a>
            </div>
          </nav>
        </div>
      </article>
    </div>
  );
};
