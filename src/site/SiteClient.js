import * as repos from './repos';
import Client from '../Client';
import uploadFile from '../upload/uploadFile';
import uploadImage from '../upload/uploadImage';

export default class SiteClient extends Client {
  constructor(token, extraHeaders = {}, baseUrl = 'https://site-api.datocms.com') {
    super(token, extraHeaders, baseUrl);

    const repoInstances = [];

    for (const [method, Klass] of Object.entries(repos)) {
      Object.defineProperty(
        this,
        method,
        {
          enumerable: true,
          get() {
            repoInstances[method] = repoInstances[method] || new Klass(this);
            return repoInstances[method];
          },
        }
      );
    }
  }

  uploadFile(source) {
    return uploadFile(this, source);
  }

  uploadImage(source) {
    return uploadImage(this, source);
  }
}
