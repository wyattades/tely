import React from 'react';

import { NavLink as OriginalNavLink } from 'react-router-dom';

const NavLink = (props) => {
  return <OriginalNavLink activeClassName="is-active" {...props} />;
};

export default NavLink;
