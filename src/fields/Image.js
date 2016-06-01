import ImgixClient from 'imgix-core-js';

const client = new ImgixClient({
  host: 'dato-images.imgix.net',
});

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
    return client.buildURL(
      this.path,
      Object.assign({ ch: 'DPR,Width', auto: 'compress,format' }, params)
    );
  }
}

