import queryString from 'query-string';

export default class File {
  constructor(value, imgixHost = 'https://www.datocms-assets.com') {
    this.value = value;
    this.imgixHost = imgixHost;
  }

  get path() {
    return this.value.path;
  }

  get format() {
    return this.value.format;
  }

  get size() {
    return this.value.size;
  }

  url(params) {
    if (params && Object.keys(params).length > 0) {
      return `${this.imgixHost}${this.path}?${queryString.stringify(params)}`;
    }
    return `${this.imgixHost}${this.path}`;
  }

  toMap() {
    return {
      format: this.format,
      size: this.size,
      url: this.url(),
    };
  }
}
