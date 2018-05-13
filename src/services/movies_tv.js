import { encodeQuery } from '../utils';

// TODO: hide API key?
const API_KEY = 'e516ac54480a35fac52c1c9c8af54200';
const API_URL = 'https://api.themoviedb.org/3/search';
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

export const search = (str, page = 1) => {
  const query = encodeQuery({
    api_key: API_KEY,
    query: encodeURIComponent(str).replace(/%20/g, '+'),
    page,
    include_adult: false,
    language: 'en-US',
  });

  const fetchMovies = fetch(`${API_URL}/movie?${query}`)
  .then((res) => res.json())
  .then((res) => res.results.map(({ id, title, poster_path, overview, release_date }) => ({
    type: 'Movie',
    title,
    image: poster_path && `${IMAGE_SRC}/${poster_path}`,
    desc: overview,
    media_id: id,
    link: `${MEDIA_URL}/movie/${id}`,
    released: release_date,
  })));

  const fetchTV = fetch(`${API_URL}/tv?${query}`)
  .then((res) => res.json())
  .then((res) => res.results.map(({ id, name, poster_path, overview, first_air_date }) => ({
    type: 'TV',
    title: name,
    image: poster_path && `${IMAGE_SRC}/${poster_path}`,
    desc: overview,
    media_id: id,
    link: `${MEDIA_URL}/tv/${id}`,
    released: first_air_date,
  })));

  return Promise.all([ fetchMovies, fetchTV ])
  .then(([ l1, l2 ]) => l1.concat(l2));
};
