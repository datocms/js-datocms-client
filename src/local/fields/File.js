import buildFileUrl from '../../utils/buildFileUrl';
import i18n from '../../utils/i18n';
import Color from './Color';

export default class File {
  constructor(value, { itemsRepo, imgixHost }) {
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
    return this.value.alt || this.upload.defaultFieldMetadata[i18n.locale].alt;
  }

  get title() {
    return (
      this.value.title || this.upload.defaultFieldMetadata[i18n.locale].title
    );
  }

  get tags() {
    return this.upload.tags;
  }

  get smartTags() {
    return this.upload.smartTags;
  }

  get isImage() {
    return this.upload.isImage;
  }

  get exifInfo() {
    return this.upload.exifInfo;
  }

  get mimeType() {
    return this.upload.mimeType;
  }

  get muxResolutions() {
    const maxRes = this.upload.muxMp4HighestRes;

    const obj = {
      mp4LowResUrl: `https://stream.mux.com/${this.upload.muxPlaybackId}/low.mp4`,
    };

    if (maxRes === 'medium') {
      obj.mp4MediumResUrl = `https://stream.mux.com/${this.upload.muxPlaybackId}/medium.mp4`;
    }

    if (maxRes === 'high') {
      obj.mp4HighResUrl = `https://stream.mux.com/${this.upload.muxPlaybackId}/high.mp4`;
    }

    return obj;
  }

  get colors() {
    return this.upload.colors.map(hex => {
      const hashlessHex = hex.charAt(0) === '#' ? hex.slice(1) : hex;
      const twoDigitHexR = hashlessHex.slice(0, 2);
      const twoDigitHexG = hashlessHex.slice(2, 4);
      const twoDigitHexB = hashlessHex.slice(4, 6);
      const twoDigitHexA = hashlessHex.slice(6, 8) || 'ff';
      const hexToDecimal = h => parseInt(h, 16);
      const rgba = {
        red: hexToDecimal(twoDigitHexR),
        green: hexToDecimal(twoDigitHexG),
        blue: hexToDecimal(twoDigitHexB),
        alpha: +(hexToDecimal(twoDigitHexA) / 255).toFixed(2),
      };
      return new Color(rgba).toMap();
    });
  }

  get blurhash() {
    return this.upload.blurhash;
  }

  get video() {
    return {
      muxPlaybackId: this.upload.muxPlaybackId,
      muxAssetStatus: this.upload.muxAssetStatus,
      framerate: this.upload.frameRate,
      duration: this.upload.duration,
      gifUrl: `https://image.mux.com/${this.upload.muxPlaybackId}/animated.gif`,
      hlsUrl: `https://stream.mux.com/${this.upload.muxPlaybackId}.m3u8`,
      thumbnailUrl: `https://image.mux.com/${this.upload.muxPlaybackId}/thumbnail.jpg`,
      ...this.muxResolutions,
    };
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
      customData: this.customData,
      copyright: this.copyright,
      tags: this.tags,
      smartTags: this.smartTags,
      filename: this.filename,
      basename: this.basename,
      isImage: this.isImage,
      exifInfo: this.exifInfo,
      mimeType: this.mimeType,
      colors: this.colors,
      blurhash: this.blurhash,
      video: this.video,
    };
  }
}
