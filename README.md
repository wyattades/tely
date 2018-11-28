# Tely

> Create and share lists of media with your Discord pals!

## About
Tely is a media aggregation platform that integrates with your Discord friends and servers.

Currently, you can create and share lists containing:
- __Movies & TV:__ Select from a large database of movies and television
- __Spotify Music:__ Spotify's extensive music library

## Technologies
Tely uses the `webpack-boiler` package for bundling and development. It supports React and SASS, and handles PWA best practices, such as manifest files and browser caching (Disclaimer: it was developed by me).

While `react` and `react-router` are used for the front-end, I utilize Firebase's Firestore as the database and Firebase Functions for handling OAuth and database triggers. Firebase provides the capability for data subscriptions using websockets as well as robust user authentication.

## Planned Features
- List item labels
- Improve general styling. Add some flare!
- Limit usage of TMDB and Discord APIs (due to rate limiting)
- Improve Spotify playback capabilities. Add support for current player
