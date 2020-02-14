import { decodeQuery, popupCenter } from './utils';
import { IS_DEV_ENV, PROJECT_ID, FIREBASE_REGION } from './env';
import { request } from './request';

const SERVER_URL = IS_DEV_ENV
  ? `http://localhost:5000/${PROJECT_ID}/${FIREBASE_REGION}/widgets`
  : `https://${FIREBASE_REGION}-${PROJECT_ID}.cloudfunctions.net/widgets`;

export const profiles = {
  spotify: null,
  discord: null,
};

// Potentially load current profiles from storage
for (const service in profiles) {
  try {
    const str = localStorage.getItem(`profile:${service}`);
    profiles[service] = JSON.parse(str);
  } catch (_) {
    // Someone put bad data in my localStorage!
  }
}

export const updateProfile = (service, data) => {
  if (!profiles[service]) profiles[service] = {};
  Object.assign(profiles[service], data);
  localStorage.setItem(`profile:${service}`, JSON.stringify(profiles[service]));
};

export const clearProfile = (service) => {
  localStorage.removeItem(`profile:${service}`);
  profiles[service] = null;
};

export const expired = (service) => {
  const expires_on = Number.parseInt(profiles[service].expires_on, 10);
  return Number.isNaN(expires_on) || Date.now() > expires_on;
};

export const signIn = (service) =>
  new Promise((resolve, reject) => {
    const popup = popupCenter(`${SERVER_URL}/auth/${service}`, 500, 600);
    if (!popup) throw 'Sign in window failed to open';

    const intervalId = setInterval(() => {
      if (!popup) {
        clearInterval(intervalId);
        throw 'Sign in window was closed unexpectedly';
      }

      let arrived = false;
      try {
        if (popup.location.hostname === window.location.hostname)
          arrived = true;
      } catch (_) {
        // Do nothing
      }

      if (arrived) {
        clearInterval(intervalId);
        const { error, ...profile } = decodeQuery(popup.location.search);
        popup.close();

        if (profile.accessToken && !error) {
          // TODO: fetch guilds and other profile info from db instead?
          // console.log('profile', service, profile);
          updateProfile(service, profile);
          resolve(profile);
        } else reject(error || 'Unknown signIn error');
      }
    }, 300);
  }).catch((err) => {
    clearProfile(service);
    throw err;
  });

export const refreshToken = async (service) => {
  const profile = profiles[service];
  if (!profile || !profile.refreshToken)
    throw { code: 401, msg: 'No refresh token available' };

  const { token } = await request({
    url: `${SERVER_URL}/auth/${service}/refresh`,
    body: {
      token: profile.refreshToken,
    },
  });

  return updateProfile(service, { accessToken: token });
};

export const apiFactory = (service, api_url, autoSignIn = false) => {
  const apiFetch = (path, accessToken, method, body) =>
    request({ url: api_url + path, accessToken, method, body });

  return async (path, method = 'GET', body) => {
    const profile = profiles[service];

    if (!profile) {
      if (autoSignIn) {
        await signIn(service);

        return apiFetch(path, profiles[service].accessToken, method, body);
      } else throw { code: 403 };
    }

    if (expired(service)) await refreshToken(service);

    try {
      return apiFetch(path, profile.accessToken, method, body);
    } catch (err) {
      if (autoSignIn && err.code === 401) {
        await refreshToken(service);

        return apiFetch(path, profile.accessToken, method, body);
      }

      throw err;
    }
  };
};
