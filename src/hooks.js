import { useState, useEffect } from 'react';

import * as db from './db';

export const useAuthUser = () => {
  const [authUser, setAuthUser] = useState(() => db.getAuthUser());

  useEffect(
    () =>
      db.onAuthStateChanged((user) => {
        setAuthUser(user);
      }),
    [],
  );

  return authUser;
};
