import { camelize } from 'humps';
import build from './fields/build';
import DateTime from './fields/DateTime';
import i18n from '../utils/i18n';
import slugify from '../utils/slugify';

export default class Item {
  constructor(entity, itemsRepo) {
    this.entity = entity;
    this.itemsRepo = itemsRepo;

    this.fields.forEach((field) => {
      Object.defineProperty(this, camelize(field.apiKey), {
        enumerable: true,
        get() {
          return this.readAttribute(field);
        },
      });
    });
  }

  get id() {
    return this.entity.id;
  }

  get itemType() {
    return this.entity.itemType;
  }

  get fields() {
    return this.itemType.fields.sort((a, b) => b.position - a.position);
  }

  get isSingleton() {
    return this.itemType.singleton;
  }

  get position() {
    return this.entity.position;
  }

  get updatedAt() {
    return new DateTime(Date.parse(this.entity.updatedAt));
  }

  slug({ prefixWithId = true } = {}) {
    const slugField = this.fields.find(f => f.apiKey === 'slug');

    if (slugField) {
      return this.readAttribute(slugField);
    }

    if (this.isSingleton) {
      return slugify(this.itemType.apiKey);
    }

    if (!this.titleField) {
      return this.id;
    }

    const title = this.readAttribute(this.titleField);

    if (title && prefixWithId) {
      return `${this.id}-${slugify(title)}`;
    } else if (title) {
      return slugify(title);
    }

    return this.id;
  }

  get titleField() {
    return this.fields.find(field => (
      field.fieldType === 'string' &&
        field.appeareance.type === 'title'
    ));
  }

  get attributes() {
    return this.fields.reduce((acc, field) => {
      return Object.assign(acc, { [camelize(field.apiKey)]: this.readAttribute(field) });
    }, {});
  }

  toMap() {
    const result = {
      id: this.id,
      itemType: this.itemType.apiKey,
      updatedAt: this.updatedAt.toMap(),
      slug: this.slug({ prefixWithId: false }),
      slugWithPrefix: this.slug(),
    };

    if (this.itemType.sortable) {
      result.position = this.position;
    }

    return this.fields.reduce((acc, field) => {
      const value = this.readAttribute(field);

      let serializedValue;
      if (value && value.toMap) {
        serializedValue = value.toMap();
      } else {
        serializedValue = value;
      }

      return Object.assign(acc, { [camelize(field.apiKey)]: serializedValue });
    }, result);
  }

  readAttribute(field) {
    const fieldType = field.fieldType;
    const localized = field.localized;

    let value;

    if (localized) {
      value = (this.entity[camelize(field.apiKey)] || {})[i18n.locale];
    } else {
      value = this.entity[camelize(field.apiKey)];
    }

    return build(fieldType, value, this.itemsRepo);
  }
}
