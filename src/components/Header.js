import React from 'react';
import { Link } from 'react-router-dom';

import * as db from '../db';

const logout = () => db.signOut()
.then(() => {
  window.location.href = '/tely'; // Reloads page
});

class NavBar extends React.Component {

  state = {
    open: false,
  }

  toggle = () => this.setState({ open: !this.state.open })

  render() {

    const loggedIn = !!db.getUser();
    const username = loggedIn && db.getProfile().username;

    return (
      <nav className="navbar is-transparent">
        <div className="container">
          <div className="navbar-brand">
            <Link className="navbar-item" to="/">
              <h1 className="is-size-4 has-text-primary">Tely</h1>
            </Link>
            <div className={`navbar-burger burger ${this.state.open ? 'is-active' : ''}`} onClick={this.toggle} role="button" tabIndex="0">
              <span/>
              <span/>
              <span/>
            </div>
          </div>
          <div className={`navbar-menu ${this.state.open ? 'is-active' : ''}`}>
            <div className="navbar-start">
              <Link className="navbar-item" to="/browse">
                Browse
              </Link>
            </div>
            <div className="navbar-end">
              <Link className="navbar-item" to="/list">
                <span>My Lists</span>
                {/* <span className="icon">
                  <i className="fas fa-list" />
                </span> */}
              </Link>
              <div className="navbar-item has-dropdown is-hoverable">
                <Link className="navbar-link" to="/account">
                  {username}
                </Link>
                <div className="navbar-dropdown is-right is-boxed">
                  <Link className="navbar-item" to="/account">
                    Account
                  </Link>
                  <hr className="navbar-divider" />
                  <a className="navbar-item" onClick={logout}>
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default NavBar;
