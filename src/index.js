import 'isomorphic-fetch';
import 'babel-polyfill';

import Session from './Session';
import ItemsRepo from './ItemsRepo';
import { post } from './request';

const defaultOptions = {
  apiBaseUrl: 'http://site-api.datocms.com',
};

export default {
  readOnlySession(options) {
    const {
      apiBaseUrl,
      domain,
      token,
    } = Object.assign({}, defaultOptions, options);

    return Promise.resolve(
      new Session(apiBaseUrl, domain, token)
    );
  },

  authenticatedSession(options) {
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
      'X-Site-Domain': domain,
    };

    return post(`${apiBaseUrl}/sessions`, payload, { headers })
      .then((response) => {
        const token = response.data.id;
        return new Session(apiBaseUrl, domain, token);
      });
  },

  ItemsRepo,
};

