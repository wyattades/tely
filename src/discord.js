import { getProfile } from './db';

const DISCORD_API = 'https://discordapp.com/api';

const api = (path, method = 'GET', body) => {
  const profile = getProfile();
  if (!profile) return Promise.reject({ code: 403 });

  return fetch(`${DISCORD_API}${path}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${profile.accessToken}`,
      // 'User-Agent': 'myDiscordUser (https://example.com, v0.1)',
    },
    mode: 'cors',
  })
  .then((res) => {
    if (res.status !== 200) {
      return res.json()
      .then((data) => {
        console.error(res, data);
        throw { code: res.status, msg: data.message };
      });
    } else return res.json();
  });
};

export const getMe = () => api('/users/@me');

export const getGuilds = () => api('/users/@me/guilds');

// TODO: /channels/${id} ???
export const getGuild = (id) => getGuilds()
.then((guilds) => {
  for (const guild of guilds) {
    if (guild.id === id) return guild;
  }
  throw { code: 400 };
});

export const MAX_GUILD_MEMBERS = 50; // TODO

export const getGuildMembers = (id) => api(`/guild/${id}/members?limit=${MAX_GUILD_MEMBERS}`)
.then((members) => members.map((member) => member.user.id));
