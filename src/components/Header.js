import React from 'react';
import { Link } from 'react-router-dom';

import * as db from '../db';

const logout = () => db.signOut()
.then(() => {
  window.location.href = '/tely';
});

class NavBar extends React.Component {

  state = {
    open: false,
  }

  toggle = () => this.setState({ open: !this.state.open })

  render() {
    return (
      <nav className="navbar is-transparent ">
        <div className="navbar-brand">
          <Link className="navbar-item" to="/">
            <h1 className="is-size-4 has-text-primary">Tely</h1>
          </Link>
          <div className="navbar-burger burger" onClick={this.toggle}>
            <span />
            <span />
            <span />
          </div>
        </div>
        <div id="navbarExampleTransparentExample" className="navbar-menu">
          <div className="navbar-start">
            <a className="navbar-item" href="https://bulma.io/">
              Home
            </a>
            <div className="navbar-item has-dropdown is-hoverable">
              <a className="navbar-link" href="/documentation/overview/start/">
                Docs
              </a>
              <div className="navbar-dropdown is-boxed">
                <Link className="navbar-item" to="/">
                  Modifiers
                </Link>
                <Link className="navbar-item" to="/">
                  Todo
                </Link>
                <Link className="navbar-item" to="/">
                  Modifiers
                </Link>
                <hr className="navbar-divider" />
                <a className="navbar-item" href="https://bulma.io/documentation/elements/box/">
                  Elements
                </a>
                <a className="navbar-item is-active" href="https://bulma.io/documentation/components/breadcrumb/">
                  Components
                </a>
              </div>
            </div>
          </div>
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="field is-grouped">
                {db.getUser() && (
                  <p className="control">
                    <button className="button is-info" onClick={logout}>
                      <span className="icon">
                        <i className="fas fa-logout" />
                      </span>
                      <span>Logout</span>
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default NavBar;
