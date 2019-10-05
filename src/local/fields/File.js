import buildFileUrl from '../../utils/buildFileUrl';
import i18n from '../../utils/i18n';

export default class File {
  constructor(value, {
    itemsRepo,
    imgixHost,
  }) {
    this.value = value;
    this.imgixHost = imgixHost;
    this.itemsRepo = itemsRepo;
    this.upload = itemsRepo.entitiesRepo.findEntity('upload', value.uploadId);
  }

  get path() {
    return this.upload.path;
  }

  get format() {
    return this.upload.format;
  }

  get size() {
    return this.upload.size;
  }

  get width() {
    return this.upload.width;
  }

  get height() {
    return this.upload.height;
  }

  get author() {
    return this.upload.author;
  }

  get notes() {
    return this.upload.notes;
  }

  get copyright() {
    return this.upload.copyright;
  }

  get alt() {
    return this.value.alt
      || this.upload.defaultFieldMetadata[i18n.locale].alt;
  }

  get title() {
    return this.value.title
      || this.upload.defaultFieldMetadata[i18n.locale].title;
  }

  get customData() {
    return Object.assign(
      this.value.customData,
      this.upload.defaultFieldMetadata[i18n.locale].customData,
    );
  }

  url(params = {}) {
    return buildFileUrl(this.upload, this.itemsRepo.entitiesRepo, params);
  }

  toMap() {
    return {
      format: this.format,
      size: this.size,
      width: this.width,
      height: this.height,
      title: this.title,
      alt: this.alt,
      url: this.url(),
    };
  }
}
