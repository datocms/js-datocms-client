import Image from './Image';
import File from './File';
import Seo from './Seo';
import Links from './Links';
import DateTime from './DateTime';
import DateOnly from './DateOnly';

const fieldTypeParser = {
  date(value) {
    return new DateOnly(Date.parse(value));
  },
  date_time(value) {
    return new DateTime(Date.parse(value));
  },
  link(value, repo) {
    return value && repo.find(value);
  },
  links(value, repo) {
    return new Links(...value.map(id => repo.find(id)));
  },
  image(value) {
    return new Image(value);
  },
  gallery(value, repo) {
    return new Gallery(...value.map(data => this.image(data)));
  },
  file(value) {
    return new File(value);
  },
  seo(value) {
    return new Seo(value);
  },
};

export default function build(fieldType, value, itemsRepo) {
  if (value && fieldTypeParser[fieldType]) {
    return fieldTypeParser[fieldType](value, itemsRepo);
  }

  return value;
}
