import { get as getRequest } from './request';
import queryString from 'query-string';

export default class Session {
  constructor(baseUrl, domain, token) {
    this.baseUrl = baseUrl;
    this.domain = domain;
    this.token = token;

    this.defaultHeaders = {
      'X-Space-Domain': domain,
      Authorization: `Bearer ${token}`,
    };
  }

  getSpace(params = {}, options = {}) {
    return this.get('/space', params, options);
  }

  getRecords(params = {}, options = {}) {
    return this.get('/records', params, options);
  }

  get(url, params = {}, options = {}) {
    const query = Object.keys(params).length ?
      `?${queryString.stringify(params)}` :
      '';

    return getRequest(
      `${this.baseUrl}${url}${query}`,
      Object.assign({ headers: this.defaultHeaders }, options)
    );
  }
}
