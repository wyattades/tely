import React, { useState } from 'react';
import { matchPath } from 'react-router-dom';

import { roleClick } from '../utils';

export const Spinner = ({ fullPage, centered }) => (
  <div
    className={`${fullPage && 'full-page'} ${centered &&
      'buttons is-centered'}`}
  >
    <div className="spinner">
      <div className="rect1" />
      <div className="rect2" />
      <div className="rect3" />
      <div className="rect4" />
      <div className="rect5" />
    </div>
  </div>
);

export const SmallSection = ({ children, size = 6, style = {} }) => (
  <section className="section" style={style}>
    <div className="container">
      <div className="columns is-centered">
        <div className={`column is-${size}`}>{children}</div>
      </div>
    </div>
  </section>
);

export const ContainerSection = ({ children }) => (
  <section className="section">
    <div className="container">{children}</div>
  </section>
);

// Similar to react-router Switch component, but keeps routes
// rendered in background after they have been visited
export class LiveSwitch extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.updateRoutes(props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setState(this.updateRoutes(this.props));
    }
  }

  UNVISITED = 0;
  VISITED = 1;
  CURRENT = 2;

  updateRoutes = ({ routes, match: prevMatch, location }) => {
    let routeFound = false;
    const routeStates = routes.map(({ path, exact, strict, sensitive }, i) => {
      const match =
        !routeFound &&
        matchPath(
          location.pathname,
          { path, exact, strict, sensitive },
          prevMatch,
        );

      if (match) {
        routeFound = true;
        return this.CURRENT;
      } else if (this.state && this.state.routeStates[i] !== this.UNVISITED)
        return this.VISITED;
      else return this.UNVISITED;
    });

    return {
      routeStates,
      routeFound,
    };
  };

  render() {
    const { routeStates, routeFound } = this.state;

    if (!routeFound) throw { code: 404 };

    return this.props.routes.map(({ element }, i) => {
      const status = routeStates[i];
      const style = status !== this.CURRENT ? { display: 'none' } : {};

      return status !== this.UNVISITED ? (
        <div key={i} style={style}>
          {element}
        </div>
      ) : null;
    });
  }
}

export const TruncateText = ({ maxLength = 200, text }) => {
  text = text || '';

  const [open, setOpen] = useState(false);

  return text.length > maxLength ? (
    <span>
      {open ? text : `${text.substring(0, maxLength - 3)}...`}
      <br />
      <a
        onClick={() => setOpen((current) => !current)}
        role="button"
        tabIndex="0"
        onKeyPress={roleClick}
      >
        {open ? 'Show Less' : 'Show More'}
      </a>
    </span>
  ) : (
    text
  );
};
