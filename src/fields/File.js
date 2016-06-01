import ImgixClient from 'imgix-core-js';

const client = new ImgixClient({
  host: 'dato-images.imgix.net',
});

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
    return client.buildURL(this.path, params);
  }
}
