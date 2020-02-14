import { encodeQuery, randInt, arrSample, toTimestamp } from '../utils';
import { BaseService } from './baseService';

// NOTE: what is this?
// volumes?q=flowers+inauthor:keyes&key=yourAPIKey

// TODO: hide API key?
const API_KEY = 'AIzaSyBXbBg-6gZx7eehLHUC4GzPbAQVPgpZqp8';
const API_URL = 'https://www.googleapis.com/books/v1';
// const IMAGE_SRC = 'https://books.google.com/books?printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api&id=';
// const MEDIA_URL = 'https://tmdb.org';

export class BooksService extends BaseService {
  ID = 'books';
  LABEL = 'Books';
  DESCRIPTION = 'Search the comprehensive Google Books database';
  CLASS = 'is-link';
  ICON = 'book';

  mapResponse = ({
    id,
    volumeInfo: {
      title,
      subtitle,
      authors,
      description,
      imageLinks,
      previewLink,
      publishedDate,
    },
  }) => ({
    service: this.ID,
    label: 'Book',
    title,
    authors,
    image: imageLinks && imageLinks.thumbnail,
    desc: description,
    subtitle,
    media_id: id,
    link: previewLink,
    released: toTimestamp(publishedDate),
  });

  async googleBooks(path, query) {
    const res = await fetch(`${API_URL}${path}?${query}`);

    if (!res.ok) throw res;

    const { items } = await res.json();

    return items.map(this.mapResponse);
  }

  async search(str, page = 1) {
    const query = encodeQuery({
      api_key: API_KEY,
      q: encodeURIComponent(str).replace(/%20/g, '+'),
      startIndex: (page - 1) * 15,
      maxResults: 15,
    });

    return this.googleBooks('/volumes', query);
  }

  async suggest(list) {
    if (list.length === 0) return [];

    const randIndex = randInt(0, list.length);
    const randItem = list[randIndex];

    return this.search(randItem.authors[0]).then((items) =>
      arrSample(items, 6),
    );
  }
}
