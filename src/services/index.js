import * as movies_tv from './movies_tv';
import * as spotify_music from './spotify_music';
import * as books from './books';

const asArray = [movies_tv, spotify_music, books];

const asObject = {};
for (const service of asArray) asObject[service.ID] = service;

export default {
  asObject,
  asArray,
};
