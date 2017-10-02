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
  image(value, { imgixHost }) {
    if (!value) { return value; }
    return new Image(value, imgixHost);
  },
  gallery(value, { imgixHost }) {
    const images = value ? value.map(data => this.image(data, imgixHost)) : [];
    return new Gallery(...images);
  },
  file(value, { imgixHost }) {
    if (!value) { return value; }
    return new File(value, imgixHost);
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
    const imgixHost = `https://${itemsRepo.site.imgixHost}`;
    return fieldTypeParser[fieldType](value, { itemsRepo, imgixHost });
  }

  return value;
}
