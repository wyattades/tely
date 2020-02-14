import { MoviesTvService } from './movies_tv';
import { SpotifyMusicService } from './spotify_music';
import { BooksService } from './books';
import { VideoGamesService } from './video_games';

const services = [
  MoviesTvService,
  SpotifyMusicService,
  BooksService,
  VideoGamesService,
].map((Service) => new Service());

export const servicesMap = {};
for (const service of services) servicesMap[service.ID] = service;

export default services;
