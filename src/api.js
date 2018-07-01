import { decodeQuery, popupCenter } from './utils';

const SERVER_URL = process.env.NODE_ENV === 'development' ?
  'http://localhost:5000/tely-db/us-central1/widgets' :
  'https://us-central1-tely-db.cloudfunctions.net/widgets';

export const profiles = {
  spotify: null,
  discord: null,
};

// Potentially load current profiles from storage
for (const service in profiles) {
  try {
    const str = localStorage.getItem(`profile.${service}`);
    profiles[service] = JSON.parse(str);
  } catch (_) {
    // Someone put bad data in my localStorage!
  }
}

export const updateProfile = (service, data) => {
  if (!profiles[service]) profiles[service] = {};
  Object.assign(profiles[service], data);
  localStorage.setItem(`profile.${service}`, JSON.stringify(profiles[service]));
};

export const clearProfile = (service) => {
  localStorage.removeItem(`profile.${service}`);
  profiles[service] = null;
};

export const signIn = (service) => new Promise((resolve, reject) => {

  // window.location.href = authUrl;
  const popup = popupCenter(`${SERVER_URL}/auth/${service}`, 500, 600);
  if (!popup) throw null;

  const intervalId = window.setInterval(() => {
    if (!popup) {
      window.clearInterval(intervalId);
      throw 'Window closed unexpectedly!';
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

export const refreshToken = (service) => fetch(`${SERVER_URL}/auth/${service}/refresh`, {
  method: 'POST',
  body: JSON.stringify({ token: profiles[service].refreshToken }),
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors',
})
.then((res) => {
  if (!res.ok) throw res.statusText;
  return res.json();
})
.then(({ token }) => updateProfile(service, { accessToken: token }))
.catch((err) => {
  // Redirect back to login when redirect token expires
  console.error('refreshToken error', err);
});

const apiFetch = (api_url, profile, path, method, body) => fetch(`${api_url}${path}`, {
  method,
  body: body ? JSON.stringify(body) : undefined,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${profile.accessToken}`,
  },
  mode: 'cors',
})
.then((res) => {
  if (res.status === 200) return res.json();
  return res.json()
  .then((data) => {
    console.error(res, data);
    throw { code: res.status, msg: data.message };
  });
});

export const apiFactory = (service, api_url, autoSignIn) => (path, method = 'GET', body) => {
  const profile = profiles[service];

  if (!profile) {
    if (autoSignIn) return signIn(service).then(() => apiFetch(api_url, profile, path, method, body));
    else return Promise.reject({ code: 403 });
  }

  return apiFetch(api_url, profile, path, method, body)
  .catch((res) => {

    if (autoSignIn && res.code === 401) {
      return refreshToken(service)
      .then(() => apiFetch(api_url, profile, path, method, body));
    }

    throw res;
  });
};
