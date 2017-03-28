import Image from './Image';
import File from './File';
import Seo from './Seo';
import Links from './Links';
import DateTime from './DateTime';
import DateOnly from './DateOnly';
import Gallery from './Gallery';
import Color from './Color';

const fieldTypeParser = {
  date(value) {
    if (!value) { return value; }
    return new DateOnly(Date.parse(value));
  },
  date_time(value) {
    if (!value) { return value; }
    return new DateTime(Date.parse(value));
  },
  link(value, repo) {
    if (!value) { return value; }
    return value && repo.find(value);
  },
  links(value, repo) {
    const items = value ? value.map(id => repo.find(id)) : [];
    return new Links(...items);
  },
  rich_text(value, repo) {
    const items = value ? value.map(id => repo.find(id)) : [];
    return new Links(...items);
  },
  image(value) {
    if (!value) { return value; }
    return new Image(value);
  },
  gallery(value) {
    const images = value ? value.map(data => this.image(data)) : [];
    return new Gallery(...images);
  },
  file(value) {
    if (!value) { return value; }
    return new File(value);
  },
  color(value) {
    if (!value) { return value; }
    return new Color(value);
  },
  seo(value) {
    if (!value) { return value; }
    return new Seo(value);
  },
};

export default function build(fieldType, value, itemsRepo) {
  if (fieldTypeParser[fieldType]) {
    return fieldTypeParser[fieldType](value, itemsRepo);
  }

  return value;
}
