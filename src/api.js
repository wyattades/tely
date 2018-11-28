import { decodeQuery, popupCenter } from './utils';

const SERVER_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/tely-db/us-central1/widgets'
  : 'https://us-central1-tely-db.cloudfunctions.net/widgets';

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

export const signIn = (service) => new Promise((resolve, reject) => {

  const popup = popupCenter(`${SERVER_URL}/auth/${service}`, 500, 600);
  if (!popup) throw null;

  const intervalId = window.setInterval(() => {
    if (!popup) {
      window.clearInterval(intervalId);
      throw 'Sign in window was closed unexpectedly';
    }
    
    let arrived = false;
    try {
      if (popup.location.hostname === window.location.hostname) arrived = true;
    } catch (_) {
      // Do nothing
    }

    if (arrived) {
      window.clearInterval(intervalId);
      const { error, ...profile } = decodeQuery(popup.location.search);
      popup.close();

      if (profile.accessToken && !error) {
        // TODO: fetch guilds and other profile info from db instead?
        console.log('profile', service, profile);
        updateProfile(service, profile);
        resolve(profile);
      } else reject(error || 'Unknown signIn error');
    }
  }, 300);

})
.catch((err) => {
  clearProfile(service);
  throw err;
});

export const apiFetch = (url, accessToken, method, body) => window.fetch(url, {
  method,
  body: body ? JSON.stringify(body) : undefined,
  headers: {
    'Content-Type': 'application/json',
    ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  },
  mode: 'cors',
})
.then((res) => {
  const contentType = res.headers.get('content-type');
  const hasJSON = contentType && contentType.indexOf('application/json') !== -1;

  if (res.ok) return hasJSON ? res.json() : {};
  
  return hasJSON
    ? res.json().then((data) => Promise.reject({ code: res.status, msg: data.message }))
    : Promise.reject({ code: res.status });
});

export const refreshToken = (service) => {
  const profile = profiles[service];
  if (!profile || !profile.refreshToken)
    throw { code: 401, msg: 'No refresh token available' };

  return apiFetch(`${SERVER_URL}/auth/${service}/refresh`, null, 'POST', {
    token: profile.refreshToken,
  })
  .then(({ token }) => updateProfile(service, { accessToken: token }));
};

export const apiFactory = (service, api_url, autoSignIn) => (path, method = 'GET', body) => {
  const profile = profiles[service];

  if (!profile) {
    if (autoSignIn) return signIn(service)
    .then(() => apiFetch(api_url + path, profiles[service].accessToken, method, body));
    else return Promise.reject({ code: 403 });
  }

  return (expired(service) ? refreshToken(service) : Promise.resolve())
  .then(() => apiFetch(api_url + path, profile.accessToken, method, body))
  .catch((res) => {

    if (autoSignIn && res.code === 401) {
      return refreshToken(service)
      .then(() => apiFetch(api_url + path, profile.accessToken, method, body));
    }

    throw res;
  });
};
