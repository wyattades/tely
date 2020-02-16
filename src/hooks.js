import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as qs from 'querystring';

import * as db from './db';
import { useLocation, useHistory } from 'react-router-dom';

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

export const useQueryParams = () => {
  const location = useLocation();
  const history = useHistory();

  const query = useMemo(() => {
    return qs.parse((location.search || '').replace(/^\?/, ''));
  }, [location]);

  const setQuery = useCallback(
    (newQuery) => {
      const search = qs.stringify(newQuery);
      history.push({ ...location, search });
    },
    [location, history],
  );

  return [query, setQuery];
};

export const useQueryParam = (key) => {
  const [query, setQuery] = useQueryParams();

  const setQueryParam = useCallback(
    (value) => {
      const newQuery = { ...query };

      if (value == null) delete newQuery[key];
      else newQuery[key] = value;

      setQuery(newQuery);
    },
    [key, query, setQuery],
  );

  return [query[key], setQueryParam];
};

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useLatest = (val) => {
  const latest = useRef(val);

  latest.current = val;

  return latest;
};

export const useEvent = (eventEmitter, eventName, cb) => {
  const savedCb = useRef(cb);

  useEffect(() => {
    savedCb.current = cb;
  }, [cb]);

  useEffect(() => {
    const ee =
      typeof eventEmitter === 'function' ? eventEmitter() : eventEmitter;

    const [on, off] =
      'on' in ee
        ? ['on', 'off']
        : 'addListener' in ee
        ? ['addListener', 'removeListener']
        : ['addEventListener', 'removeEventListener'];

    const handler = (...args) => savedCb.current(...args);

    ee[on](eventName, handler);
    return () => {
      ee[off](eventName, handler);
    };
  }, [eventName, eventEmitter]);
};

// window is undefined on initial render in SSR apps
const getWindow = () => window;
export const useWindowEvent = (eventName, cb) =>
  useEvent(getWindow, eventName, cb);
