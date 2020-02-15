import { decodeQuery, popupCenter, toInt, waitFor } from './utils';
import { IS_DEV_ENV, PROJECT_ID, FIREBASE_REGION } from './env';
import { request } from './request';

const SERVER_URL = IS_DEV_ENV
  ? `http://localhost:5000/${PROJECT_ID}/${FIREBASE_REGION}/widgets`
  : `https://${FIREBASE_REGION}-${PROJECT_ID}.cloudfunctions.net/widgets`;

const profiles = {
  spotify: null,
  discord: null,
};

// Potentially load current profiles from storage
for (const service in profiles) {
  try {
    const str = localStorage.getItem(`profile:${service}`);
    const profile = JSON.parse(str);
    if (profile && typeof profile === 'object') profiles[service] = profile;
  } catch (_) {
    // Someone put bad data in my localStorage!
  }
}

export const getProfile = (service) => {
  const profile = profiles[service];
  if (profile === undefined) throw `Service ${service} not found!`;

  return profile;
};

export const hasProfile = (service) => {
  const profile = profiles[service];
  if (profile === undefined) throw `Service ${service} not found!`;

  return profile !== null;
};

export const updateProfile = (service, data) => {
  profiles[service] = profiles[service] || {};
  Object.assign(profiles[service], data);
  localStorage.setItem(`profile:${service}`, JSON.stringify(profiles[service]));
};

export const clearProfile = (service) => {
  localStorage.removeItem(`profile:${service}`);
  profiles[service] = null;
};

export const expired = (service) => {
  if (!hasProfile(service)) return true;

  const expiresOn = toInt(getProfile(service).expires_on);
  return !expiresOn || Date.now() > expiresOn;
};

export const signIn = async (service) => {
  try {
    const popup = popupCenter(`${SERVER_URL}/auth/${service}`, 500, 600);
    if (!popup) throw 'Sign in window failed to open';

    await waitFor(
      () => {
        if (!popup) throw 'Sign in window was closed unexpectedly';

        let arrived = false;
        try {
          if (popup.location.hostname === window.location.hostname)
            arrived = true;
        } catch (_) {
          // Do nothing
        }

        if (arrived) {
          const { error, ...profile } = decodeQuery(popup.location.search);
          popup.close();

          if (error) throw error;
          else if (profile.accessToken) {
            // TODO: fetch guilds and other profile info from db instead?
            // console.log('profile', service, profile);
            updateProfile(service, profile);
            return true;
          } else throw 'Failed to receive signIn accessToken';
        }

        return false;
      },
      {
        interval: 300,
        timeout: null,
      },
    );

    return getProfile(service);
  } catch (err) {
    clearProfile(service);
    throw err;
  }
};

export const refreshToken = async (service) => {
  const refreshToken = hasProfile(service) && getProfile(service).refreshToken;
  if (!refreshToken) throw { code: 401, msg: 'No refresh token available' };

  const { accessToken } = await request({
    url: `${SERVER_URL}/auth/${service}/refresh`,
    body: {
      refreshToken,
    },
  });

  return updateProfile(service, { accessToken });
};

export const apiFactory = (service, api_url, autoSignIn = false) => {
  const apiFetch = async (path, accessToken, method, body) => {
    return request({ url: api_url + path, accessToken, method, body });
  };

  return async (path, method = 'GET', body, routeAutoSignIn = false) => {
    if (!hasProfile(service)) {
      if (routeAutoSignIn || autoSignIn) {
        await signIn(service);

        // signIn might clear accessToken
        return apiFetch(path, getProfile(service)?.accessToken, method, body);
      } else throw { code: 403 };
    }

    if (expired(service)) await refreshToken(service);

    try {
      return apiFetch(path, getProfile(service)?.accessToken, method, body);
    } catch (err) {
      if ((routeAutoSignIn || autoSignIn) && err.code === 401) {
        await refreshToken(service);

        return apiFetch(path, getProfile(service)?.accessToken, method, body);
      }

      throw err;
    }
  };
};
