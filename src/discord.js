import { apiFactory } from './api';

const DISCORD_API = 'https://discordapp.com/api';

const api = apiFactory('discord', DISCORD_API);

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
