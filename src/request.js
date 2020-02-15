import * as qs from 'querystring';

export const request = async ({
  url,
  accessToken,
  query,
  headers = {},
  method,
  contentType = 'application/json',
  body,
}) => {
  if (query) url = `${url}?${qs.stringify(query)}`;

  const res = await fetch(url, {
    method: method || (body ? 'POST' : 'GET'),
    body: body
      ? typeof body === 'object'
        ? JSON.stringify(body)
        : body
      : undefined,
    headers: {
      ...(contentType ? { 'Content-Type': contentType } : {}),
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  const resType = res.headers.get('content-type');
  let data;
  try {
    if (resType && resType.indexOf('application/json') !== -1)
      data = await res.json();
    else if (resType && resType.indexOf('text/plain') !== -1)
      data = await res.text();
  } catch (err) {
    console.error(err);
    throw { code: res.status, msg: res.statusText };
  }

  if (!res.ok) {
    console.error(res);

    const msg =
      (typeof data === 'string' && data) ||
      (data && typeof data === 'object' && data.message) ||
      res.statusText;
    throw { code: res.status, msg };
  }

  return data;
};
