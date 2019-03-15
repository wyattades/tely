// volumes?q=flowers+inauthor:keyes&key=yourAPIKey

import React from 'react';

import { encodeQuery, randInt, arrSample, toTimestamp } from '../utils';
import { TruncateText } from '../components/misc'; // TODO


// TODO: hide API key?
const API_KEY = 'AIzaSyBXbBg-6gZx7eehLHUC4GzPbAQVPgpZqp8';
const API_URL = 'https://www.googleapis.com/books/v1';
// const IMAGE_SRC = 'https://books.google.com/books?printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api&id=';
// const MEDIA_URL = 'https://tmdb.org';

export const ID = 'books';
export const LABEL = 'Books';
export const DESCRIPTION = 'Search the comprehensive Google Books database';
export const CLASS = 'is-link';
export const ICON = 'book';

export const init = () => {};

export const renderBody = ({ desc = '', authors, subtitle }) => (
  <>
    { subtitle && <><small>{subtitle}</small><br/></> }
    { authors && <>By <span className="has-text-link">{authors.join(', ')}</span><br/></> }
    <hr style={{ margin: '0.5rem 0' }}/>
    <TruncateText text={desc}/>
  </>
);

export const textBody = ({ desc = '', authors, subtitle }) => {
  const body = [];

  if (subtitle) body.push(subtitle);
  if (authors) body.push(authors.join(', '));
  if (desc) body.push(desc.length > 120 ? `${desc.substring(0, 120)}...` : desc);

  return body.join(' -- ');
};

const mapResponse = ({ id, volumeInfo: { title, subtitle, authors, description, imageLinks, previewLink, publishedDate } }) => ({
  service: ID,
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

const googleBooks = (path, query) => window.fetch(`${API_URL}${path}?${query}`)
.then((res) => {
  if (!res.ok) return Promise.reject(res);
  return res;
})
.then((res) => res.json())
.then((res) => console.log(res) || res.items.map(mapResponse));

export const search = (str, page = 1) => {
  const query = encodeQuery({
    api_key: API_KEY,
    q: encodeURIComponent(str).replace(/%20/g, '+'),
    startIndex: (page - 1) * 15,
    maxResults: 15,
  });

  return googleBooks('/volumes', query);
};

export const suggest = (list) => {

  if (list.length === 0) return Promise.resolve([]);

  const randIndex = randInt(0, list.length);
  const randItem = list[randIndex];

  return search(randItem.authors[0])
  .then((items) => arrSample(items, 6));
};
