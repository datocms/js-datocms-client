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
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
    this.extraHeaders = extraHeaders;
  }

  get(...args) {
    return this.request(this.buildGetRequest(...args));
  }

  buildGetRequest(url, params = {}, options = {}) {
    return this.buildFetchRequest('GET', url, params, undefined, options);
  }

  delete(...args) {
    return this.request(this.buildDeleteRequest(...args));
  }

  buildDeleteRequest(url, params = {}, options = {}) {
    return this.buildFetchRequest('DELETE', url, params, undefined, options);
  }

  put(...args) {
    return this.request(this.buildPutRequest(...args));
  }

  buildPutRequest(url, body, params = {}, options = {}) {
    return this.buildFetchRequest('PUT', url, params, body, options);
  }

  post(...args) {
    return this.request(this.buildPostRequest(...args));
  }

  buildPostRequest(url, body, params = {}, options = {}) {
    return this.buildFetchRequest('POST', url, params, body, options);
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

  buildFetchRequest(method, url, params, body, extraOptions) {
    const options = {
      method,
      ...(extraOptions || {}),
    };

    if (body) {
      options.body = JSON.stringify(body, undefinedToNull);
    }

    const headers = {
      ...this.defaultHeaders(),
      ...this.extraHeaders,
      ...options.headers,
    };

    Object.keys(headers).forEach(key => !headers[key] && delete headers[key]);

    return {
      url: this.buildUrl(url, params),
      options: { ...options, headers },
    };
  }

  request(fetchRequest, preCallStack = new Error().stack, retryCount = 1) {
    return fetch(fetchRequest.url, fetchRequest.options)
      .then(res => {
        if (res.status === 429) {
          const waitTime = parseInt(
            res.headers.get('X-RateLimit-Reset') || '10',
            10,
          );
          console.log(
            `Rate limit exceeded, waiting ${waitTime * retryCount} seconds...`,
          );
          return wait(waitTime * retryCount * 1000).then(() => {
            return this.request(fetchRequest, preCallStack, retryCount + 1);
          });
        }

        return (res.status !== 204 ? res.json() : Promise.resolve(null))
          .then(body => {
            if (res.status >= 200 && res.status < 300) {
              return Promise.resolve(body);
            }
            return Promise.reject(
              new ApiException(res, body, {
                ...fetchRequest,
                preCallStack,
              }),
            );
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
                return this.request(fetchRequest, preCallStack, retryCount + 1);
              });
            }
            throw error;
          });
      })
      .catch(error => {
        if (error.code && error.code.includes('ETIMEDOUT')) {
          console.log(
            `Error "${error.code}", waiting ${retryCount} seconds to retry...`,
          );
          return wait(retryCount * 1000).then(() => {
            return this.request(fetchRequest, preCallStack, retryCount + 1);
          });
        }

        throw error;
      });
  }
}
