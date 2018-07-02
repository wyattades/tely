import React from 'react';
import { matchPath } from 'react-router-dom';

export const Spinner = ({ fullPage, centered }) => (
  <div className={`${fullPage && 'full-page'} ${centered && 'buttons is-centered'}`}>
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

// Similar to react-router Switch component, but keeps routes
// rendered in background after they have been visited
export class LiveSwitch extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.updateRoutes(props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.setState(this.updateRoutes(nextProps));
    }
  }

  UNVISITED = 0;
  VISITED = 1;
  CURRENT = 2;

  updateRoutes = ({ routes, match: prevMatch, location }) => {

    let routeFound = false;
    const routeStates = routes.map(({ path, exact, strict, sensitive }, i) => {
      const match = !routeFound && matchPath(
        location.pathname,
        { path, exact, strict, sensitive },
        prevMatch,
      );

      if (match) {
        routeFound = true;
        return this.CURRENT;
      } else if (this.state && this.state.routeStates[i] !== this.UNVISITED) return this.VISITED;
      else return this.UNVISITED;

    });

    return {
      routeStates,
      routeFound,
    };
  }

  render() {
    const { routeStates, routeFound } = this.state;

    if (!routeFound) throw { code: 404 };

    return this.props.routes.map(({ element }, i) => {
      const status = routeStates[i];
      const style = status !== this.CURRENT ? { display: 'none' } : {};

      return status !== this.UNVISITED ? <div key={i} style={style}>{element}</div> : null;
    });
  }
}
