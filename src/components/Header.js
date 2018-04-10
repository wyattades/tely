import React from 'react';
import { NavLink } from 'react-router-dom';

import * as db from '../db';

const logout = () => db.signOut()
.then(() => {
  window.location.href = '/tely';
});

const NavBar = () => (
  <nav className="navbar is-transparent is-fixed">
    <div className="navbar-brand">
      <a className="navbar-item" href="https://bulma.io">
        Tely
      </a>
      <div className="navbar-burger burger">
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
            <a className="navbar-item" href="/documentation/overview/start/">
              Overview
            </a>
            <a className="navbar-item" href="https://bulma.io/documentation/modifiers/syntax/">
              Modifiers
            </a>
            <a className="navbar-item" href="https://bulma.io/documentation/columns/basics/">
              Columns
            </a>
            <a className="navbar-item" href="https://bulma.io/documentation/layout/container/">
              Layout
            </a>
            <a className="navbar-item" href="https://bulma.io/documentation/form/general/">
              Form
            </a>
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
                <button className="button is-primary" onClick={logout}>
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

export default NavBar;

// export default () => (
//   <div>
//     <nav>
//       <ul>
//         <li><NavItem title="Home" to="/"/></li>
//         <li><NavItem title="Your Lists" to="/list"/></li>
//         <li><NavItem title="Account" to="/account"/></li>
//       </ul>
//     </nav>
//   </div>
// );
