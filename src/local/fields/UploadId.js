import buildFileUrl from '../../utils/buildFileUrl';

export default class UploadId {
  constructor(value, { itemsRepo, imgixHost }) {
    this.imgixHost = imgixHost;
    this.itemsRepo = itemsRepo;
    this.upload = itemsRepo.entitiesRepo.findEntity('upload', value);
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

  url(params = {}) {
    return buildFileUrl(this.upload, this.itemsRepo.entitiesRepo, params);
  }

  toMap() {
    return {
      format: this.format,
      size: this.size,
      width: this.width,
      height: this.height,
      url: this.url(),
    };
  }
}
