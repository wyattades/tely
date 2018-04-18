import React from 'react';

export default ({ id, title, desc, author, created, img }) => (
  <div className="box" key={id}>
    <article className="media">
      <div className="media-left">
        <figure className="image is-64x64">
          <img src="https://bulma.io/images/placeholders/128x128.png" alt="" />
        </figure>
      </div>
      <div className="media-content">
        <div className="content">
          <p>
            <strong>{title}</strong> <small>@{author}</small> <small>{created}</small>
            <br />
            {desc}
          </p>
        </div>
        <nav className="level is-mobile">
          <div className="level-left">
            <a className="level-item">
              <span className="icon is-small"><i className="fas fa-reply" /></span>
            </a>
            <a className="level-item">
              <span className="icon is-small"><i className="fas fa-retweet" /></span>
            </a>
            <a className="level-item">
              <span className="icon is-small"><i className="fas fa-heart" /></span>
            </a>
          </div>
        </nav>
      </div>
    </article>
  </div>
);
