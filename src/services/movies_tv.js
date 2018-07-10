import React from 'react';

import { encodeQuery, randInt } from '../utils';
import { TruncateText } from '../components/misc'; // TODO


// TODO: hide API key?
const API_KEY = 'e516ac54480a35fac52c1c9c8af54200';
const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_SRC = 'https://image.tmdb.org/t/p/w92';
const MEDIA_URL = 'https://tmdb.org';

/*
"poster_sizes": [
  "w92",
  "w154",
  "w185",
  "w342",
  "w500",
  "w780",
  "original"
],
*/

export const ID = 'movies_tv';
export const LABEL = 'Movies & TV';
export const DESCRIPTION = 'Select from a large database of movies and television';
export const CLASS = 'is-warning';
export const ICON = 'tv';

export const init = () => {};

export const renderBody = ({ desc }) => <TruncateText text={desc}/>;

// const LABELS = {
//   tv: 'TV',
//   movie: 'Movie',
// };
// const LABELS_R = {};
// for (const key in LABELS) LABELS_R[LABELS[key]] = key;

const mapResponse = (type) => ({ id, title, name, poster_path, overview, release_date, first_air_date }) => ({
  label: type === 'tv' ? 'TV' : 'Movie',
  title: type === 'tv' ? name : title,
  image: poster_path && `${IMAGE_SRC}${poster_path}`,
  desc: overview,
  media_id: id,
  link: `${MEDIA_URL}/${type}/${id}`,
  released: type === 'tv' ? first_air_date : release_date,
});

const tmdbFetch = (type, path, query) => fetch(`${API_URL}${path}?${query}`)
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

  const listMap = {};
  for (const listItem of list) listMap[listItem.media_id] = true;

  let sample = [ ...list ];

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

      sample.splice(randIndex, 1);
      let counter = 0;
      for (const item of recommendations) {
        if (!(item.media_id in listMap) && !(item.media_id in resultMap)) {
          results.push(item);
          resultMap[item.media_id] = true;
          if (results.length >= 6) {
            return results;
          }
          counter++;
          if (counter >= 2) break;
        }
      }
      return getMore();
    });
  };

  return getMore();
};
