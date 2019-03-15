import React from 'react';

import { encodeQuery, randInt, arrSample, toTimestamp } from '../utils';
import { TruncateText } from '../components/misc'; // TODO


// TODO: hide API key?
const API_KEY = 'e516ac54480a35fac52c1c9c8af54200';
const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_SRC = 'https://image.tmdb.org/t/p/w92';
const MEDIA_URL = 'https://tmdb.org';

export const ID = 'movies_tv';
export const LABEL = 'Movies & TV';
export const DESCRIPTION = 'Select from a large database of movies and television';
export const CLASS = 'is-warning';
export const ICON = 'tv';

export const init = () => {};

export const renderBody = ({ desc }) => <TruncateText text={desc}/>;

export const textBody = ({ desc = '' }) => desc.length > 120 ? `${desc.substring(0, 120)}...` : desc;

const mapResponse = (type) => ({ id, title, name, poster_path, overview, release_date, first_air_date }) => ({
  service: ID,
  label: type === 'tv' ? 'TV' : 'Movie',
  title: type === 'tv' ? name : title,
  image: poster_path && `${IMAGE_SRC}${poster_path}`,
  desc: overview,
  media_id: id,
  link: `${MEDIA_URL}/${type}/${id}`,
  released: toTimestamp(type === 'tv' ? first_air_date : release_date),
});

const tmdbFetch = (type, path, query) => window.fetch(`${API_URL}${path}?${query}`)
.then((res) => {
  if (!res.ok) return Promise.reject(res);
  return res;
})
.then((res) => res.json())
.then((res) => res.results.map(mapResponse(type)));

export const search = (str, page = 1) => {
  const query = encodeQuery({
    api_key: API_KEY,
    query: encodeURIComponent(str).replace(/%20/g, '+'),
    page,
    include_adult: false,
  });

  return Promise.all([ tmdbFetch('movie', '/search/movie', query), tmdbFetch('tv', '/search/tv', query) ])
  .then(([ l1, l2 ]) => l1.concat(l2));
};

export const suggest = (list) => {

  if (list.length === 0) return Promise.resolve([]);

  let maxRecPerItem;
  if (list.length === 1) maxRecPerItem = 6;
  else if (list.length === 2) maxRecPerItem = 3;
  else maxRecPerItem = 2;

  const listMap = {};
  const sample = [ ...list ];
  for (const listItem of list) listMap[listItem.media_id] = true;

  const resultMap = {};
  const results = [];

  const query = encodeQuery({
    api_key: API_KEY,
  });

  const getMore = () => {
    if (sample.length === 0) return Promise.resolve(results);

    const randIndex = randInt(0, sample.length);
    const randItem = sample[randIndex];
    if (!(randItem.label in { TV: 0, Movie: 0 })) return Promise.reject('Invalid item label');
    const type = randItem.label.toLowerCase();
  
    return tmdbFetch(type, `/${type}/${randItem.media_id}/recommendations`, query)
    .then((recommendations) => {

      // TODO: show user which items recommendations are based on

      const shuffledRecs = arrSample(recommendations, 6);

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
    });
  };

  return getMore();
};
