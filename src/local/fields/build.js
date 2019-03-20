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
  link(value, { itemsRepo }) {
    if (!value) { return value; }
    return value && itemsRepo.find(value);
  },
  links(value, { itemsRepo }) {
    const items = value ? value.map(id => itemsRepo.find(id)) : [];
    return new Links(...items);
  },
  rich_text(value, { itemsRepo }) {
    const items = value ? value.map(id => itemsRepo.find(id)) : [];
    return new Links(...items);
  },
  gallery(value, { imgixHost, itemsRepo }) {
    const images = value ? value.map(data => this.file(data, { imgixHost, itemsRepo })) : [];
    return new Gallery(...images);
  },
  file(value, { imgixHost, itemsRepo }) {
    if (!value) { return value; }
    return new File(value, { itemsRepo, imgixHost });
  },
  color(value) {
    if (!value) { return value; }
    return new Color(value);
  },
  seo(value, { itemsRepo }) {
    if (!value) { return value; }
    return new Seo(value, { itemsRepo });
  },
  json(value) {
    if (!value) { return value; }
    return JSON.parse(value);
  },
};

export default function build(fieldType, value, itemsRepo) {
  if (fieldTypeParser[fieldType]) {
    return fieldTypeParser[fieldType](value, { itemsRepo, imgixHost: itemsRepo.site.imgixHost });
  }

  return value;
}
