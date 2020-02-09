import React from 'react';

import { encodeQuery, arrSample, toTimestamp } from '../utils';
import { apiFactory } from '../api';
import { initPlayer } from '../spotify_player';

export const ID = 'spotify_music';
export const LABEL = 'Spotify Music';
export const DESCRIPTION = "Spotify's extensive music library";
export const CLASS = 'is-success';
export const ICON = 'music';

const API_URL = 'https://api.spotify.com/v1';
const api = apiFactory('spotify', API_URL, true);

export const init = () => initPlayer();

export const renderBody = ({ artist, artist_id, album, album_id }) => (
  <>
    By <a href={`https://open.spotify.com/artist/${artist_id}`}>{artist}</a>
    <br />
    <small>
      <a href={`https://open.spotify.com/album/${album_id}`}>{album}</a>
    </small>
  </>
);

export const textBody = ({ artist }) =>
  artist ? `by ${artist}` : '[Unknown artist]';

const mapResponse = ({ external_urls, artists, id, name, album }) => ({
  service: ID,
  label: 'Song',
  title: name,
  image: album.images && album.images.length > 1 && album.images[1].url,
  media_id: id,
  link: external_urls.spotify,
  released: toTimestamp(album.release_date),
  artist: artists.length && artists[0].name,
  artist_id: artists.length && artists[0].id,
  album: album.name,
  album_id: album.id,
});

export const search = (str, page = 1) => {
  const query = encodeQuery({
    q: str,
    type: 'track',
    limit: 15,
    offset: (page - 1) * 15,
    market: 'US',
  });

  return api(`/search?${query}`).then((res) =>
    res.tracks.items.map(mapResponse),
  );
};

export const suggest = (list) => {
  if (list.length === 0) return Promise.resolve([]);

  const samples = arrSample(list, 5, true).map((item) => item.media_id);

  const query = encodeQuery({
    seed_tracks: samples.join(','),
    type: 'track',
    limit: 10,
  });

  return api(`/recommendations?${query}`).then((res) => {
    const listMap = {};
    for (const listItem of list) listMap[listItem.media_id] = true;

    const results = [];
    for (const item of res.tracks) {
      if (!(item.id in listMap)) {
        results.push(item.id);
        if (results.length >= 6) {
          break;
        }
      }
    }

    if (!results.length) return results;

    const query2 = encodeQuery({
      ids: results.join(','),
    });

    return api(`/tracks?${query2}`).then((res2) =>
      res2.tracks.map(mapResponse),
    );
  });
};
