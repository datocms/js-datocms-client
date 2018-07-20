import File from './File';

export default class Theme {
  constructor(value, { imgixHost, itemsRepo }) {
    this.value = value;
    this.imgixHost = imgixHost;
    this.itemsRepo = itemsRepo;
  }

  get primaryColor() {
    return this.value.primaryColor;
  }

  get lightColor() {
    return this.value.lightColor;
  }

  get darkColor() {
    return this.value.darkColor;
  }

  get accentColor() {
    return this.value.accentColor;
  }

  get logo() {
    const { imgixHost, itemsRepo } = this;

    return this.value.logo
      && new File(this.value.logo, { itemsRepo, imgixHost });
  }

  toMap() {
    return {
      logo: this.logo && this.logo.toMap(),
      primaryColor: this.primaryColor,
      lightColor: this.lightColor,
      darkColor: this.darkColor,
      accentColor: this.accentColor,
    };
  }
}
