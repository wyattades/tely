import { apiFactory, getProfile } from './api';
import { servicesMap } from './services';
import { isEmpty } from './utils';
import { request } from './request';

export const MATCH_ID = /\d{6,20}/;

const DISCORD_API = 'https://discordapp.com/api';

const CLIENT_URL = `${process.env.URL}${process.env.BASENAME}`;

export const MAX_GUILD_MEMBERS = 64; // TODO

const api = apiFactory('discord', DISCORD_API);

// export const getMe = () => api('/users/@me');

export const getGuilds = () => api('/users/@me/guilds', 'GET', null, true);

// export const getFriends = () => api('/users/@me/channels');

const IMAGE_URL = 'https://cdn.discordapp.com';

export const userAvatar = (profile = getProfile('discord'), size = 128) =>
  profile.avatar
    ? `${IMAGE_URL}/avatars/${profile.id}/${profile.avatar}.png?size=${size}`
    : `${IMAGE_URL}/embed/avatars/${parseInt(profile.discriminator, 10) %
        5}.png?size=${size}`;

export const serverIcon = (serverId, icon) =>
  `${IMAGE_URL}/icons/${serverId}/${icon}.png`;

export const sendWebhooks = (listMeta, item) => {
  if (isEmpty(listMeta.webhooks)) return;

  const profile = getProfile('discord');
  const service = servicesMap[listMeta.type];

  const payload = {
    embeds: [
      {
        title: `Added New ${service.LABEL} to: ${listMeta.name}`,
        url: `${CLIENT_URL}/list/${listMeta.id}`,
        color: 53682, // is-primary
        thumbnail: {
          url: item.image,
        },
        author: {
          name: profile.username,
          icon_url: userAvatar(),
        },
        fields: [
          {
            name: item.title,
            value: service.textBody(item),
          },
        ],
        footer: {
          text: '© Tely',
        },
      },
    ],
  };

  for (const key in listMeta.webhooks) {
    request({
      url: listMeta.webhooks[key],
      body: payload,
    }).catch((err) =>
      console.error('Failed to webhook into:', listMeta.webhooks[key], err),
    );
  }
};
