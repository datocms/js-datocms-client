import Seo from './Seo';

export default class GlobalSeo {
  constructor(value) {
    this.value = value;
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

  get facebookPageUrl() {
    return this.value.facebookPageUrl;
  }

  get fallbackSeo() {
    return this.value.fallbackSeo && new Seo(this.value.fallbackSeo);
  }

  toMap() {
    return {
      siteName: this.siteName,
      titleSuffix: this.titleSuffix,
      facebookPageUrl: this.facebookPageUrl,
      twitterAccount: this.twitterAccount,
      fallbackSeo: this.fallbackSeo && this.fallbackSeo.toMap(),
    };
  }
}

