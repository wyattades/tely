import React from 'react';

import * as db from '../db';
import { TruncateText } from '../components/misc';
import { initPlayer } from '../spotify_player';

import { MoviesTvService } from './movies_tv';
import { SpotifyMusicService } from './spotify_music';
import { BooksService } from './books';
import { VideoGamesService } from './video_games';

class AppMoviesTvService extends MoviesTvService {
  renderBody({ desc }) {
    return (
      <p>
        <TruncateText text={desc} />
      </p>
    );
  }

  textBody({ desc = '' }) {
    return desc.length > 120 ? `${desc.substring(0, 120)}...` : desc;
  }
}

class AppSpotifyMusicService extends SpotifyMusicService {
  async init() {
    initPlayer();
  }

  renderBody({ artist, artist_id, album, album_id }) {
    return (
      <p>
        By <a href={`https://open.spotify.com/artist/${artist_id}`}>{artist}</a>
        <br />
        <small>
          <a href={`https://open.spotify.com/album/${album_id}`}>{album}</a>
        </small>
      </p>
    );
  }

  textBody({ artist }) {
    return artist ? `by ${artist}` : '[Unknown artist]';
  }
}

class AppBooksService extends BooksService {
  renderBody({ desc, authors, subtitle }) {
    return (
      <>
        <p className="is-marginless">
          {subtitle && (
            <>
              <small>{subtitle}</small>
              <br />
            </>
          )}
          {authors && (
            <>
              By <span className="has-text-link">{authors.join(', ')}</span>
              <br />
            </>
          )}
        </p>
        <hr style={{ margin: '0.5rem 0' }} />
        <p>
          <TruncateText text={desc} />
        </p>
      </>
    );
  }

  textBody({ desc, authors, subtitle }) {
    const body = [];

    if (subtitle) body.push(subtitle);
    if (authors) body.push(authors.join(', '));
    if (desc)
      body.push(desc.length > 120 ? `${desc.substring(0, 120)}...` : desc);

    return body.join(' -- ');
  }
}

class AppVideoGamesService extends VideoGamesService {
  renderBody({ desc }) {
    return (
      <p>
        <TruncateText text={desc} />
      </p>
    );
  }

  textBody({ desc = '' }) {
    return desc;
  }
}

const services = [
  AppMoviesTvService,
  AppSpotifyMusicService,
  AppBooksService,
  AppVideoGamesService,
].map((Service) => {
  const s = new Service();

  if (s.proxied) {
    // s._search = s.search.bind(s);
    // s._suggest = s.suggest.bind(s);
    s.search = async (...args) =>
      (await db.callable('servicesSearch', { serviceType: s.ID, args })).data;
    s.suggest = async (...args) =>
      (await db.callable('servicesSuggest', { serviceType: s.ID, args })).data;
  }

  return s;
});

export const servicesMap = {};
for (const service of services) servicesMap[service.ID] = service;

export default services;
