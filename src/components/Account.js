import React from 'react';

import * as db from '../db';
import { ContainerSection } from './misc';

export default () => {
  const user = db.getProfile();
  return (
    <ContainerSection>
      <h1 className="is-size-1">Account</h1>
      <p>{user.username}#{user.discriminator}</p>
      <p>{user.email}</p>
      <pre>
        {JSON.stringify(user, null, 2)}
      </pre>
    </ContainerSection>
  );
};
