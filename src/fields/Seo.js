import Image from './Image';

export default class Seo {
  constructor(value) {
    this.value = value;
  }

  get title() {
    return this.value.title;
  }

  get description() {
    return this.value.description;
  }

  get image() {
    return this.value.image && new Image(this.value.image);
  }
}

