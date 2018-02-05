import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';
import fetchAllPages from '../fetchAllPages';

export default class UploadRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'upload',
        attributes: [
          'size',
          'width',
          'height',
          'path',
          'format',
          'alt',
          'title',
        ],
        requiredAttributes: [
          'size',
          'width',
          'height',
          'path',
          'format',
          'alt',
          'title',
        ],
      }
    );
    return this.client.post('/uploads', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  all(params = {}, options = {}) {
    const deserializeResponse = Object.prototype.hasOwnProperty.call(options, 'deserializeResponse') ?
      options.deserializeResponse :
      true;

    const allPages = Object.prototype.hasOwnProperty.call(options, 'allPages') ?
      options.allPages :
      false;

    let request;

    if (allPages) {
      request = fetchAllPages(this.client, '/uploads', params);
    } else {
      request = this.client.get('/uploads', params);
    }

    return request
    .then(response => Promise.resolve(
      deserializeResponse ?
        deserializeJsonApi(response) :
        response
    ));
  }

  find(uploadId) {
    return this.client.get(`/uploads/${uploadId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(uploadId) {
    return this.client.delete(`/uploads/${uploadId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(uploadId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      uploadId,
      resourceAttributes,
      {
        type: 'upload',
        attributes: [
          'alt',
          'title',
        ],
      }
    );
    return this.client.put(`/uploads/${uploadId}`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }
}
