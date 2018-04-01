import React from 'react';

export default ({ id, title, desc, author, date, img }) => (
  <div className="list-item" key={id}>
    <img src={img} alt={title}/>
    <div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <p><i>{author}</i>{date}</p>
    </div>
  </div>
);
