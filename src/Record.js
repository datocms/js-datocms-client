import Image from './fields/Image';
import File from './fields/File';
import Seo from './fields/Seo';
import slugify from 'slugify';

function slug(text) {
  return slugify(text.replace(/_/, ' ').toLowerCase());
}

const fieldTypeParser = {
  date(value) {
    return Date.parse(value);
  },
  date_time(value) {
    return Date.parse(value);
  },
  link(value, repo) {
    return value && repo.find(value);
  },
  links(value, repo) {
    return value.map(id => repo.find(id));
  },
  image(value) {
    return new Image(value);
  },
  file(value) {
    return new File(value);
  },
  seo(value) {
    return new Seo(value);
  },
};

export default class Record {
  constructor(entity, repo) {
    this.entity = entity;
    this.repo = repo;

    this.fields.forEach((field) => {
      Object.defineProperty(this, field.api_key, {
        get() {
          const fieldType = field.field_type;
          const localized = field.localized;
          let value;

          if (localized) {
            value = (entity[field.api_key] || {})[repo.locale];
          } else {
            value = entity[field.api_key];
          }

          if (value && fieldTypeParser[fieldType]) {
            return fieldTypeParser[fieldType](value, repo);
          }

          return value;
        },
      });
    });
  }

  get id() {
    return this.entity.id;
  }

  get contentType() {
    return this.entity.content_type;
  }

  get fields() {
    return this.contentType.fields.sort((a, b) => b.position - a.position);
  }

  get isSingleton() {
    return this.contentType.singleton;
  }

  get position() {
    return this.entity.position;
  }

  get updatedAt() {
    return Date.parse(this.entity.updated_at);
  }

  get slug() {
    if (this.isSingleton) {
      return slug(this.contentType.api_key);
    }

    const titleField = this.fields.find(field => (
      field.field_type === 'string' &&
        field.appeareance.type === 'title'
    ));

    if (titleField && this[titleField.api_key]) {
      return `${this.id}-${slug(this[titleField.api_key], { lower: true })}`;
    }

    return this.id;
  }
}
