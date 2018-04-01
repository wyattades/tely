import React from 'react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ title, icon, to }) => (
  <NavLink exact to={to} title={title}>{title}</NavLink>
);

export default () => (
  <div>
    <nav>
      <ul>
        <li><NavItem title="Home" to="/"/></li>
        <li><NavItem title="Your Lists" to="/list"/></li>
        <li><NavItem title="Account" to="/account"/></li>
      </ul>
    </nav>
  </div>
);
