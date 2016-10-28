import queryString from 'query-string';

export default class File {
  constructor(value) {
    this.value = value;
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

  url(params = {}) {
    const baseUrl = 'https://dato-images.imgix.net';
    return `${baseUrl}${this.path}?${queryString.stringify(params)}`;
  }

  toMap() {
    return {
      format: this.format,
      size: this.size,
      url: this.url(),
    };
  }
}
