import File from './fields/File';
import Theme from './fields/Theme';
import GlobalSeo from './fields/GlobalSeo';
import faviconTagsBuilder from '../utils/faviconTagsBuilder';
import localizedRead from '../utils/localizedRead';
import i18n from '../utils/i18n';

export default class Site {
  constructor(entity, itemsRepo) {
    this.entity = entity;
    this.itemsRepo = itemsRepo;
  }

  get id() {
    return this.entity.id;
  }

  get name() {
    return this.entity.name;
  }

  get locales() {
    return this.entity.locales;
  }

  get theme() {
    return this.readAttribute('theme', Theme, false);
  }

  get domain() {
    return this.entity.domain;
  }

  get imgixHost() {
    return this.entity.imgixHost;
  }

  get internalDomain() {
    return this.entity.internalDomain;
  }

  get noIndex() {
    return this.entity.noIndex;
  }

  get globalSeo() {
    return this.readAttribute('globalSeo', GlobalSeo, this.locales.length > 1);
  }

  get favicon() {
    return this.readAttribute('favicon', File, false);
  }

  get faviconMetaTags() {
    return faviconTagsBuilder(this.entity.repo);
  }

  toMap() {
    const fields = [
      'id',
      'name',
      'locales',
      'theme',
      'domain',
      'internalDomain',
      'noIndex',
      'globalSeo',
      'favicon',
      'faviconMetaTags',
    ];

    return fields.reduce((acc, field) => {
      let value = this[field];

      if (value && value.toMap) {
        value = value.toMap();
      }

      return Object.assign(acc, { [field]: value });
    }, {});
  }

  readAttribute(attribute, TypeKlass, localized) {
    const value = localizedRead(this.entity, attribute, localized, i18n);
    return value && new TypeKlass(value, { imgixHost: this.imgixHost, itemsRepo: this.itemsRepo });
  }
}
