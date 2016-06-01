import 'isomorphic-fetch';

import Session from './Session';
import { post } from './request';

const defaultOptions = {
  apiBaseUrl: 'http://api.datocms.com',
};

export function readOnlySession(options) {
  const {
    apiBaseUrl,
    domain,
    token,
  } = Object.assign({}, defaultOptions, options);

  return Promise.resolve(
    new Session(apiBaseUrl, domain, token)
  );
}

export function authenticatedSession(options) {
  const {
    apiBaseUrl,
    email,
    password,
    domain,
  } = Object.assign({}, defaultOptions, options);

  const payload = {
    data: {
      type: 'email_credentials',
      attributes: { email, password },
    },
  };

  const headers = {
    'X-Space-Domain': domain,
  };

  return post(`${apiBaseUrl}/sessions`, payload, { headers })
    .then((response) => {
      const token = response.data.id;
      return new Session(apiBaseUrl, domain, token);
    });
}
