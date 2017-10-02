import queryString from 'query-string';

export default class Image {
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

  get width() {
    return this.value.width;
  }

  get height() {
    return this.value.height;
  }

  get alt() {
    return this.value.alt;
  }

  get title() {
    return this.value.title;
  }

  url(params = {}) {
    if (Object.keys(params).length > 0) {
      return `${this.imgixHost}${this.path}?${queryString.stringify(params)}`;
    }
    return `${this.imgixHost}${this.path}`;
  }

  toMap() {
    return {
      format: this.format,
      size: this.size,
      width: this.width,
      height: this.height,
      title: this.title,
      alt: this.alt,
      url: this.url(),
    };
  }
}

