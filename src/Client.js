import queryString from 'querystring';

import { camelizeKeys, decamelizeKeys as humpsDecamelizeKeys } from 'humps';
import ApiException from './ApiException';
import pkg from '../package.json';
import fetch from './utils/fetch';

const decamelizeKeys = (payload) => {
  return humpsDecamelizeKeys(payload, (key, convert, options) => {
    if (key === 'require2fa') {
      return 'require_2fa';
    }
    return convert(key, options);
  });
};

export default class Client {
  constructor(token, extraHeaders, baseUrl) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.extraHeaders = extraHeaders;
  }

  get(url, params = {}, options = {}) {
    return this.request(
      this.buildUrl(url, params),
      options,
    );
  }

  put(url, body, params = {}, options = {}) {
    return this.request(
      this.buildUrl(url, params),
      Object.assign(
        {
          method: 'PUT',
          body: JSON.stringify(decamelizeKeys(body)),
        },
        options,
      ),
    );
  }

  post(url, body, params = {}, options = {}) {
    return this.request(
      this.buildUrl(url, params),
      Object.assign(
        {
          method: 'POST',
          body: JSON.stringify(decamelizeKeys(body)),
        },
        options,
      ),
    );
  }

  delete(url, params = {}, options = {}) {
    return this.request(
      this.buildUrl(url, params),
      Object.assign(
        {
          method: 'DELETE',
        },
        options,
      ),
    );
  }

  defaultHeaders() {
    return {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${this.token}`,
      'user-agent': `js-client v${pkg.version}`,
      'X-Api-Version': '2',
    };
  }

  buildUrl(path, params = {}) {
    const query = Object.keys(params).length
      ? `?${queryString.stringify(params)}`
      : '';
    return `${this.baseUrl}${path}${query}`;
  }

  request(url, options = {}) {
    const fullHeaders = Object.assign(
      {},
      this.defaultHeaders(),
      this.extraHeaders,
      options.headers,
    );

    const fullOptions = Object.assign(
      {},
      options,
      { headers: fullHeaders },
    );

    return fetch(url, fullOptions)
      .then((res) => {
        if (res.status !== 204) {
          return res.json().then(body => [res, body]);
        }
        return Promise.resolve([res, null]);
      })
      .then(([res, body]) => {
        if (res.status >= 200 && res.status < 300) {
          return Promise.resolve(camelizeKeys(body));
        }
        return Promise.reject(new ApiException(res, camelizeKeys(body)));
      });
  }
}
