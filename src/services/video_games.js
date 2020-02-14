import { toTimestamp, arrSample, arrUnique, shuffle } from '../utils';
import { BaseService } from './baseService';
import { request } from '../request';

// TODO: hide API key?
const API_KEY = 'e821ae27ae2d21c1524a74a4341f737d';
const API_URL = 'https://api-v3.igdb.com';

const WEBSITE_CATEGORIES = {
  OFFICIAL: 1,
};

export class VideoGamesService extends BaseService {
  ID = 'video_games';
  LABEL = 'Video Games';
  DESCRIPTION = 'Find any video game!';
  CLASS = 'is-discordmain';
  ICON = 'gamepad';
  proxied = true;

  findWebsiteUrl(websites) {
    if (!websites || !websites.length) return null;

    for (const w of websites) {
      if (w.category === WEBSITE_CATEGORIES.OFFICIAL) return w.url;
    }

    return null;
  }

  mapResponse = ({
    id,
    summary,
    name,
    first_release_date,
    url,
    cover,
    similar_games,
    websites,
    // tags,
    // themes,
    // platforms,
    // keywords,
    // genres,
    // artworks,
    // rating,
    // screenshots,
  }) => ({
    media_id: id,
    service: this.ID,
    label: 'Video Game',
    title: name,
    desc: summary || undefined,
    link: this.findWebsiteUrl(websites) || url,
    similarGames: similar_games,
    released: toTimestamp(first_release_date),
    image: (cover && cover.url) || undefined,
  });

  gamesFields = 'name,summary,first_release_date,url,cover.url,websites.*';

  apicalypse(query) {
    return Object.entries(query)
      .map(([key, val]) => `${key} ${key === 'search' ? `"${val}"` : val};`)
      .join(' ');
  }

  async gamesDB(path, data) {
    return request({
      url: `${API_URL}${path}`,
      contentType: false,
      body: this.apicalypse(data),
      headers: {
        'user-key': API_KEY,
      },
    });
  }

  // `page` is currently unused
  async search(str, _page = 1) {
    // await request({
    //   url: `${API_URL}/headers`,
    //   body: {
    //     api_header: {
    //       header: 'Access-Control-Allow-Origin',
    //       value: '*',
    //     },
    //   },
    //   headers: {
    //     'user-key': API_KEY,
    //   },
    // });

    const items = await this.gamesDB('/games', {
      fields: this.gamesFields + ',similar_games',
      search: str,
      // where: 'websites.category = 1',
      limit: 15,
    });

    return items.map(this.mapResponse);
  }

  async suggest(list) {
    if (list.length === 0) return [];

    let ids = [].concat(...list.map((l) => l.similarGames || []));

    const limit = 8;

    ids = arrSample(arrUnique(ids), limit);

    const items = await this.gamesDB('/games', {
      fields: this.gamesFields,
      where: `id = (${ids.join(',')})`,
      limit,
    });

    return shuffle(items).map(this.mapResponse);
  }
}
