import { encodeQuery, shuffle } from '../utils';

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

const mapResponse = (type) => ({ id, title, name, poster_path, overview, release_date, first_air_date }) => ({
  type: type === 'tv' ? 'TV' : 'Movie',
  title: type === 'tv' ? name : title,
  image: poster_path && `${IMAGE_SRC}/${poster_path}`,
  desc: overview,
  media_id: id,
  link: `${MEDIA_URL}/${type}/${id}`,
  released: type === 'tv' ? first_air_date : release_date,
});

const tmdbFetch = (type, method, query) => fetch(`${API_URL}/${method}/${type}?${query}`)
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

  return Promise.all([ tmdbFetch('movie', 'search', query), tmdbFetch('tv', 'search', query) ])
  .then(([ l1, l2 ]) => l1.concat(l2));
};

export const suggest = (list) => {

  const query = encodeQuery({
    api_key: API_KEY,
    // sort_by: 'popularity.desc',
  });

  // const fetchMovies = fetch(`${API_URL}/discover/movie?${query}`)
  // .then((res) => res.json())
  // .then((res) => console.log(res) || res)
  // .then((res) => res.results.map(mapResponse('movie')));

  // const fetchTV = fetch(`${API_URL}/discover/tv?${query}`)
  // .then((res) => res.json())
  // .then((res) => console.log(res) || res)
  // .then((res) => res.results.map(mapResponse('tv')));

  return Promise.all([ tmdbFetch('movie', 'discover', query), tmdbFetch('tv', 'discover', query) ])
  .then(([ l1, l2 ]) => shuffle(l1.concat(l2)));
};
