import queryString from 'querystring';
import ApiException from './ApiException';
import pkg from '../package.json';
import fetch from './utils/fetch';
import wait from './utils/wait';

const undefinedToNull = (k, v) => (v === undefined ? null : v);

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
          body: JSON.stringify(body, undefinedToNull),
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
          body: JSON.stringify(body, undefinedToNull),
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

    // TODO console.log(url, fullOptions);

    return fetch(url, fullOptions)
      .then((res) => {
        if (res.status === 429) {
          const waitTime = res.headers.get('X-RateLimit-Reset') || '10';
          console.log(`Rate limit exceeded, waiting ${waitTime} seconds...`);
          return wait(parseInt(waitTime, 10) * 1000).then(() => {
            return this.request(url, options);
          });
        }

        return (res.status !== 204 ? res.json() : Promise.resolve(null))
          .then((body) => {
            if (res.status >= 200 && res.status < 300) {
              return Promise.resolve(body);
            }
            return Promise.reject(new ApiException(res, body));
          })
          .catch((error) => {
            if (
              error
                && error.body
                && error.body.data
                && error.body.data.some(e => e.attributes.code === 'BATCH_DATA_VALIDATION_IN_PROGRESS')
            ) {
              return wait(1000).then(() => {
                return this.request(url, options);
              });
            }
            throw error;
          });
      });
  }
}
