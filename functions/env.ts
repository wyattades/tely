import * as functions from 'firebase-functions';

export const IS_DEV_ENV = process.env.NODE_ENV === 'development';

export const config = IS_DEV_ENV
  ? require('./.runtimeconfig.json')
  : functions.config();

export const PROJECT_ID = 'tely-db';

export const SERVER_URL = IS_DEV_ENV
  ? 'http://localhost:5000/tely-db/us-central1/widgets'
  : 'https://us-central1-tely-db.cloudfunctions.net/widgets';

export const ORIGIN_URL = IS_DEV_ENV
  ? 'http://localhost:8080'
  : 'https://tely.app';
