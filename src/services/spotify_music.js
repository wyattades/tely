import { encodeQuery, arrSample } from '../utils';
import { apiFactory } from '../api';

export const ID = 'spotify_music';
export const LABEL = 'Spotify Music';
export const DESCRIPTION = 'Spotify\'s extensive music library';
export const CLASS = 'is-success';
export const ICON = 'music';

const API_URL = 'https://api.spotify.com/v1';
const api = apiFactory('spotify', API_URL, true);


const mapResponse = ({ external_urls, artists, id, name, album }) => ({
  type: 'Song',
  title: name,
  image: album.images[1].url,
  media_id: id,
  link: external_urls.spotify,
  released: album.release_date ? new Date(album.release_date).getTime() : null,
  desc: `by ${artists[0].name}`,
});

export const search = (str, page = 1) => {

  const query = encodeQuery({
    q: str,
    type: 'track',
    limit: 15,
    market: 'US',
  });

  return api(`/search?${query}`)
  .then((res) => res.tracks.items.map(mapResponse));
};

export const suggest = (list) => {

  const samples = arrSample(list, 5, true).map((item) => item.media_id);

  const query = encodeQuery({
    seed_tracks: samples.join(','),
    type: 'track',
    limit: 10,
    // market: 'US',
  });

  return api(`/recommendations?${query}`)
  .then((res) => {
    const listMap = {};
    for (const listItem of list) listMap[listItem.media_id] = true;

    const results = [];
    for (const item of res.tracks) {
      if (!(item.id in listMap)) {
        results.push(mapResponse(item));
        if (results.length >= 6) {
          break;
        }
      }
    }

    return results;
  });
};
