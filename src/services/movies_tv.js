import { encodeQuery, randInt, arrSample, toTimestamp } from '../utils';
import { BaseService } from './baseService';

// TODO: hide API key?
const API_KEY = 'e516ac54480a35fac52c1c9c8af54200';
const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_SRC = 'https://image.tmdb.org/t/p/w92';
const MEDIA_URL = 'https://tmdb.org';

export class MoviesTvService extends BaseService {
  ID = 'movies_tv';
  LABEL = 'Movies & TV';
  DESCRIPTION =
    "Select from the TheMovieDB's database of movies and television";
  CLASS = 'is-warning';
  ICON = 'tv';

  mapResponse = (type) => ({
    id,
    title,
    name,
    poster_path,
    overview,
    release_date,
    first_air_date,
  }) => ({
    service: this.ID,
    label: type === 'tv' ? 'TV' : 'Movie',
    title: type === 'tv' ? name : title,
    image: poster_path && `${IMAGE_SRC}${poster_path}`,
    desc: overview,
    media_id: id,
    link: `${MEDIA_URL}/${type}/${id}`,
    released: toTimestamp(type === 'tv' ? first_air_date : release_date),
  });

  async tmdbFetch(type, path, query) {
    const res = await fetch(`${API_URL}${path}?${query}`);

    if (!res.ok) throw res;

    const { results } = await res.json();

    return results.map(this.mapResponse(type));
  }

  async search(str, page = 1) {
    const query = encodeQuery({
      api_key: API_KEY,
      query: encodeURIComponent(str).replace(/%20/g, '+'),
      page,
      include_adult: false,
    });

    const arrays = await Promise.all([
      this.tmdbFetch('movie', '/search/movie', query),
      this.tmdbFetch('tv', '/search/tv', query),
    ]);

    return [].concat(...arrays);
  }

  async suggest(list) {
    if (list.length === 0) return [];

    let maxRecPerItem;
    if (list.length === 1) maxRecPerItem = 6;
    else if (list.length === 2) maxRecPerItem = 3;
    else maxRecPerItem = 2;

    const listMap = {};
    const sample = [...list];
    for (const listItem of list) listMap[listItem.media_id] = true;

    const resultMap = {};
    const results = [];

    const query = encodeQuery({
      api_key: API_KEY,
    });

    const getMore = async () => {
      if (sample.length === 0) return results;

      const randIndex = randInt(0, sample.length);
      const randItem = sample[randIndex];
      if (!(randItem.label in { TV: 0, Movie: 0 })) throw 'Invalid item label';

      const type = randItem.label.toLowerCase();

      const recs = await this.tmdbFetch(
        type,
        `/${type}/${randItem.media_id}/recommendations`,
        query,
      );
      // TODO: show user which items recommendations are based on

      const shuffledRecs = arrSample(recs, 6);

      sample.splice(randIndex, 1);
      let counter = 0;
      for (const item of shuffledRecs) {
        if (!(item.media_id in listMap) && !(item.media_id in resultMap)) {
          results.push(item);
          resultMap[item.media_id] = true;
          if (results.length >= 6) {
            return results;
          }
          counter++;
          if (counter >= maxRecPerItem) break;
        }
      }

      return getMore();
    };

    return getMore();
  }
}
