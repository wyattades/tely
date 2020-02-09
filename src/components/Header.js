import React from 'react';
import { Link, withRouter } from 'react-router-dom';

import NavLink from './NavLink';
import { roleClick } from '../utils';
import * as db from '../db';

// To support a fixed header, add this class to document head
document.documentElement.classList.add('has-navbar-fixed-top');

class Header extends React.PureComponent {
  state = {
    open: false,
    loggedIn: !!db.getProfile(),
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.location !== nextProps.location)
      this.setState({
        open: false,
        loggedIn: !!db.getProfile(), // HACK to check if loggedIn state changes
      });
  }

  toggle = () => this.setState(({ open }) => ({ open: !open }));

  signIn = () =>
    db
      .signIn()
      .then((path) => this.props.history.push(path))
      .catch(console.error);

  render() {
    const { open, loggedIn } = this.state;

    const username = db.getProfile() && db.getProfile().username;

    return (
      <nav className="navbar is-transparent has-shadow is-fixed-top">
        <div className="container">
          <div className="navbar-brand">
            <Link className="navbar-item" to="/">
              <h1 className="is-size-4 site-title">Tely</h1>
            </Link>
            <div
              className={`navbar-burger burger ${open ? 'is-active' : ''}`}
              onClick={this.toggle}
              role="button"
              tabIndex="0"
              onKeyPress={roleClick}
            >
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className={`navbar-menu ${open ? 'is-active' : ''}`}>
            <div className="navbar-start">
              <NavLink
                className="navbar-item"
                activeClassName="is-active"
                to="/browse"
              >
                Browse
              </NavLink>
              <NavLink className="navbar-item" to="/about">
                About
              </NavLink>
            </div>
            <div className="navbar-end">
              {loggedIn ? (
                <>
                  <NavLink className="navbar-item" to="/labels">
                    <span>Labels</span>
                  </NavLink>
                  <NavLink className="navbar-item" to="/list">
                    <span>My Lists</span>
                  </NavLink>
                  <div className="navbar-item has-dropdown is-hoverable">
                    <NavLink className="navbar-link" to="/account">
                      {username}
                    </NavLink>
                    <div className="navbar-dropdown is-right is-boxed">
                      <Link className="navbar-item" to="/account">
                        Account
                      </Link>
                      <hr className="navbar-divider" />
                      <Link className="navbar-item" to="/logout">
                        Logout
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <a className="navbar-item">
                  <button className="button is-discord" onClick={this.signIn}>
                    Sign In
                  </button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default withRouter(Header);
