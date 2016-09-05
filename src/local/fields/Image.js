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
    const augmentedParams = Object.assign(
      { ch: 'DPR,Width', auto: 'compress,format' },
      params
    );
    const baseUrl = 'https://dato-images.imgix.net/';
    return `${baseUrl}${this.path}?${queryString.stringify(augmentedParams)}`;
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

