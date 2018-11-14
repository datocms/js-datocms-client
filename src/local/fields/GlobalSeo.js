import Seo from './Seo';

export default class GlobalSeo {
  constructor(value, { imgixHost, itemsRepo }) {
    this.value = value;
    this.imgixHost = imgixHost;
    this.itemsRepo = itemsRepo;
  }

  get siteName() {
    return this.value.siteName;
  }

  get titleSuffix() {
    return this.value.titleSuffix;
  }

  get twitterAccount() {
    return this.value.twitterAccount;
  }

  get twitterCard() {
    return this.value.twitterCard;
  }

  get facebookPageUrl() {
    return this.value.facebookPageUrl;
  }

  get fallbackSeo() {
    const { imgixHost, itemsRepo } = this;
    return this.value.fallbackSeo
      && new Seo(this.value.fallbackSeo, { imgixHost, itemsRepo });
  }

  toMap() {
    return {
      siteName: this.siteName,
      titleSuffix: this.titleSuffix,
      facebookPageUrl: this.facebookPageUrl,
      twitterCard: this.twitterCard,
      twitterAccount: this.twitterAccount,
      fallbackSeo: this.fallbackSeo && this.fallbackSeo.toMap(),
    };
  }
}
