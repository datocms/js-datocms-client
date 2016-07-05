import {
  get as getRequest,
  put as putRequest,
} from './request';

import queryString from 'query-string';

export default class Session {
  constructor(baseUrl, domain, token) {
    this.baseUrl = baseUrl;
    this.domain = domain;
    this.token = token;

    this.defaultHeaders = {
      'X-Site-Domain': domain,
      Authorization: `Bearer ${token}`,
    };
  }

  getSite(params = {}, options = {}) {
    return this.get('/site', params, options);
  }

  getItems(params = {}, options = {}) {
    return this.get('/items', params, options);
  }

  getItem(id, params = {}, options = {}) {
    return this.get(`/items/${id}`, params, options);
  }

  updateItem(id, body, params = {}, options = {}) {
    return this.put(`/items/${id}`, body, params, options);
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

  put(url, body, params = {}, options = {}) {
    const query = Object.keys(params).length ?
      `?${queryString.stringify(params)}` :
      '';

    return putRequest(
      `${this.baseUrl}${url}${query}`,
      body,
      Object.assign({ headers: this.defaultHeaders }, options)
    );
  }
}
