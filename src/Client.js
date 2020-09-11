import qs from 'qs';
import ApiException from './ApiException';
import pkg from '../package.json';
import fetch from './utils/fetch';
import wait from './utils/wait';

const undefinedToNull = (k, v) => (v === undefined ? null : v);

function queryString(query) {
  return qs.stringify(query, { arrayFormat: 'brackets' });
}

export default class Client {
  constructor(token, extraHeaders, baseUrl) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.extraHeaders = extraHeaders;
  }

  get(url, params = {}, options = {}) {
    return this.request(this.buildUrl(url, params), options);
  }

  put(url, body, params = {}, options = {}) {
    return this.request(this.buildUrl(url, params), {
      method: 'PUT',
      body: JSON.stringify(body, undefinedToNull),
      ...options,
    });
  }

  post(url, body, params = {}, options = {}) {
    return this.request(this.buildUrl(url, params), {
      method: 'POST',
      body: JSON.stringify(body, undefinedToNull),
      ...options,
    });
  }

  delete(url, params = {}, options = {}) {
    return this.request(this.buildUrl(url, params), {
      method: 'DELETE',
      ...options,
    });
  }

  defaultHeaders() {
    return {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${this.token}`,
      'user-agent': `js-client v${pkg.version}`,
      'X-Api-Version': '3',
    };
  }

  buildUrl(path, params = {}) {
    const query = Object.keys(params).length ? `?${queryString(params)}` : '';
    return `${this.baseUrl}${path}${query}`;
  }

  request(url, options = {}, retryCount = 1) {
    const fullHeaders = {
      ...this.defaultHeaders(),
      ...this.extraHeaders,
      ...options.headers,
    };

    const fullOptions = { ...options, headers: fullHeaders };

    return fetch(url, fullOptions).then(res => {
      if (res.status === 429) {
        const waitTime = parseInt(
          res.headers.get('X-RateLimit-Reset') || '10',
          10,
        );
        console.log(
          `Rate limit exceeded, waiting ${waitTime * retryCount} seconds...`,
        );
        return wait(waitTime * retryCount * 1000).then(() => {
          return this.request(url, options, retryCount + 1);
        });
      }

      return (res.status !== 204 ? res.json() : Promise.resolve(null))
        .then(body => {
          if (res.status >= 200 && res.status < 300) {
            return Promise.resolve(body);
          }
          return Promise.reject(new ApiException(res, body));
        })
        .catch(error => {
          if (
            error &&
            error.body &&
            error.body.data &&
            error.body.data.some(
              e => e.attributes.code === 'BATCH_DATA_VALIDATION_IN_PROGRESS',
            )
          ) {
            console.log(
              `Data validation in progress, waiting ${retryCount} seconds...`,
            );
            return wait(retryCount * 1000).then(() => {
              return this.request(url, options, retryCount + 1);
            });
          }
          throw error;
        });
    });
  }
}
