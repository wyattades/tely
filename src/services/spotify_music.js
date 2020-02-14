import { encodeQuery, arrSample, toTimestamp } from '../utils';
import { apiFactory } from '../api';
import { BaseService } from './baseService';

const API_URL = 'https://api.spotify.com/v1';
const api = apiFactory('spotify', API_URL, true);

export class SpotifyMusicService extends BaseService {
  ID = 'spotify_music';
  LABEL = 'Spotify Music';
  DESCRIPTION = "Spotify's extensive music library";
  CLASS = 'is-success';
  ICON = 'music';

  mapResponse = ({ external_urls, artists, id, name, album }) => ({
    service: this.ID,
    label: 'Song',
    title: name,
    image: album.images && album.images.length > 1 && album.images[1].url,
    media_id: id,
    link: external_urls.spotify,
    released: toTimestamp(album.release_date),
    artist: artists.length && artists[0].name,
    artist_id: artists.length && artists[0].id,
    album: album.name,
    album_id: album.id,
  });

  async search(str, page = 1) {
    const { tracks } = await api(
      `/search?${encodeQuery({
        q: str,
        type: 'track',
        limit: 15,
        offset: (page - 1) * 15,
        market: 'US',
      })}`,
    );

    return tracks.items.map(this.mapResponse);
  }

  async suggest(list) {
    if (list.length === 0) return [];

    const samples = arrSample(list, 5, true).map((item) => item.media_id);

    const { tracks: recommendedTracks } = await api(
      `/recommendations?${encodeQuery({
        seed_tracks: samples.join(','),
        type: 'track',
        limit: 10,
      })}`,
    );

    const listMap = {};
    for (const listItem of list) listMap[listItem.media_id] = true;

    const results = [];
    for (const item of recommendedTracks) {
      if (!(item.id in listMap)) {
        results.push(item.id);
        if (results.length >= 6) {
          break;
        }
      }
    }

    if (!results.length) return [];

    const { tracks } = await api(
      `/tracks?${encodeQuery({
        ids: results.join(','),
      })}`,
    );

    return tracks.map(this.mapResponse);
  }
}
