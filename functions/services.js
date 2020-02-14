import * as functions from 'firebase-functions';

import { servicesMap } from '../src/services/apiServices';

export const servicesSearch = functions.https.onCall(async (data, _ctx) => {
  const service = servicesMap[data.serviceType];

  if (!service || !service.proxied)
    throw { status: 400, message: 'invalid serviceType' };

  const items = await service.search(...data.args);

  return items;
});

export const servicesSuggest = functions.https.onCall(async (data, _ctx) => {
  const service = servicesMap[data.serviceType];

  if (!service || !service.proxied)
    throw { status: 400, message: 'invalid serviceType' };

  const items = await service.suggest(...data.args);

  return items;
});
