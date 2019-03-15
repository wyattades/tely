import * as movies_tv from './movies_tv';
import * as spotify_music from './spotify_music';
import * as books from './books';


const asArray = [
  movies_tv,
  spotify_music,
  books,
];

const asObject = {
  movies_tv,
  spotify_music,
  books,
};

export default {
  asObject,
  asArray,
};
