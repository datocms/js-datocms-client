import queryString from 'query-string';

export default class Image {
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

  get width() {
    return this.value.width;
  }

  get height() {
    return this.value.height;
  }

  url(params = {}) {
    return this.rawUrl(Object.assign(
      { ch: 'DPR,Width', auto: 'format' },
      params
    ));
  }

  rawUrl(params = {}) {
    const baseUrl = 'https://dato-images.imgix.net';
    return `${baseUrl}${this.path}?${queryString.stringify(params)}`;
  }

  toMap() {
    return {
      format: this.format,
      size: this.size,
      width: this.width,
      height: this.height,
      url: this.url(),
    };
  }
}

