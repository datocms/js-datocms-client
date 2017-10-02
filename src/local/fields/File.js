import queryString from 'query-string';

export default class File {
  constructor(value, imgixHost) {
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
