import { apiFactory, apiFetch, profiles } from './api';
import services from './services';
import { isEmpty } from './utils';

export const MATCH_ID = /\d{6,20}/;

const DISCORD_API = 'https://discordapp.com/api';
const AVATAR_URL = 'https://cdn.discordapp.com/avatar';
export const ICON_URL = 'https://cdn.discordapp.com/icons';

const CLIENT_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080/tely'
  : 'https://wyattades.github.io/tely';

export const MAX_GUILD_MEMBERS = 64; // TODO

const api = apiFactory('discord', DISCORD_API);

export const getMe = () => api('/users/@me');

export const getGuilds = () => api('/users/@me/guilds');

export const getFriends = () => api('/users/@me/channels');

export const sendWebhooks = (listMeta, item) => {
  if (isEmpty(listMeta.webhooks)) return;

  const profile = profiles.discord;
  const serviceLabel = services.asObject[listMeta.type].LABEL;

  const payload = {
    embeds: [{
      title: `Added New ${serviceLabel} to __${listMeta.name}__`,
      url: `${CLIENT_URL}/list/${listMeta.id}`,
      timestamp: new Date().toISOString(),
      color: 16762902, // TODO
      thumbnail: {
        url: item.image,
      },
      author: {
        name: profile.username,
        icon_url: `${AVATAR_URL}/${profile.id}/${profile.icon}.png`,
      },
      fields: [{
        name: item.title,
        value: item.type === 'spotify_music' ? `by ${item.author}` : (item.released || '---'),
      }],
      footer: {
        text: '© Tely',
      },
    }],
  };

  for (const key in listMeta.webhooks) {
    apiFetch(listMeta.webhooks[key], null, 'post', payload)
    .catch(() => console.log('Failed to webhook into:', listMeta.webhooks[key]));
  }
};
