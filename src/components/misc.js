import React from 'react';
import { matchPath } from 'react-router-dom';

import { roleClick } from '../utils';

export const Spinner = ({ fullPage, centered }) => (
  <div className={`${fullPage && 'full-page'} ${centered && 'buttons is-centered'}`}>
    <div className="spinner">
      {/* <div className="bounce1"/>
      <div className="bounce2"/>
      <div className="bounce3"/> */}
      <div className="rect1"/>
      <div className="rect2"/>
      <div className="rect3"/>
      <div className="rect4"/>
      <div className="rect5"/>
    </div>
  </div>
);

export const SmallSection = ({ children, size = 6 }) => (
  <section className="section">
    <div className="container">
      <div className="columns is-centered">
        <div className={`column is-${size}`}>
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

export class LiveTextEdit extends React.Component {

  state = {
    value: this.props.value,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value)
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ value: this.props.value });
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  clearTimeout() {
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  timeout = null;

  onKeyPress = (e) => {
    if (e.which === 13) {
      e.target.blur();
    }
  }

  onBlur = () => {
    this.clearTimeout();
    this.props.onUpdate(this.state.value);
  }

  onChange = (e) => {
    const value = e.target.value;

    this.clearTimeout();

    if (value) {
      this.timeout = window.setTimeout(() => {
        this.props.onUpdate(value);
        this.timeout = null;
      }, 500);
    }

    this.setState({ value });
  }

  render() {
    const { value: _, onUpdate: __, className = '', ...inputProps } = this.props;
    const { value } = this.state;

    return <>
      <input type="text" {...inputProps} value={value} className={`live-text-edit ${className}`}
        onChange={this.onChange} onKeyPress={this.onKeyPress} onBlur={this.onBlur}/>
      {/* <span className="fas fa-edit"></span> */}
    </>;
  }
}

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

export class TruncateText extends React.Component {

  static defaultProps = {
    maxLength: 200,
  }

  constructor(props) {
    super(props);

    this.state = {
      truncated: props.text.length > props.maxLength,
    };
  }

  open = () => this.setState({
    truncated: false,
  })
  
  render() {
    if (this.state.truncated) {
      return (
        <span>
          {this.props.text.substring(0, this.props.maxLength - 3)}...
          <br/>
          <a onClick={this.open} role="button" tabIndex="0" onKeyPress={roleClick}>Show More</a>
        </span>
      );
    } else {
      return this.props.text;
    }
  }
}
