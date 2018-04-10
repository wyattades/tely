import { getProfile } from './db';

const DISCORD_API = 'https://discordapp.com/api';

const api = (path, method = 'GET', body) => fetch(`${DISCORD_API}${path}`, {
  method,
  body: body ? JSON.stringify(body) : undefined,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getProfile().accessToken}`,
    'User-Agent': 'myDiscordUser (https://example.com, v0.1)',
  },
  mode: 'cors',
})
.then((res) => {
  if (res.status !== 200) {
    console.error(res);
    return res.json()
    .then(({ message }) => {
      throw { code: res.status, msg: message };
    });
  } else return res.json();
});

export const getMe = () => api('/users/@me');

export const getGuilds = () => api('/users/@me/guilds');

export const getGuild = (id) => getGuilds()
.then((guilds) => {
  for (const guild of guilds) {
    if (guild.id === id) return guild;
  }
  throw { code: 400 };
});
