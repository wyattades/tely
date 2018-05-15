import React from 'react';
import { matchPath } from 'react-router-dom';

export const Spinner = ({ fullPage }) => (
  <div className={fullPage ? 'full-page' : ''}>
    <div className="spinner">
      <div className="bounce1"/>
      <div className="bounce2"/>
      <div className="bounce3"/>
    </div>
  </div>
);

export const SmallSection = ({ children }) => (
  <section className="section">
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-half">
          {children}
        </div>
      </div>
    </div>
  </section>
);

export const ContainerSection = ({ children }) => (
  <section className="section">
    <div className="container">
      {children}
    </div>
  </section>
);

// Similar to react-router Switch component, but keeps routes rendered in background
export const LiveSwitch = ({ location, match: prevMatch, routes }) => {
  let routeFound = false;

  const children = routes.map(({ element, path, exact, strict, sensitive }) => {
    const match = matchPath(
      location.pathname,
      { path, exact, strict, sensitive },
      prevMatch,
    );

    let style;
    if (match) routeFound = true;
    else style = { display: 'none' };

    return <div key={path} style={style}>{element}</div>;
  });

  if (routeFound) return children;
  else throw { code: 404 };
};
