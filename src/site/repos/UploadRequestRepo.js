import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class UploadRequestRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'upload_request',
        attributes: [
          'filename',
        ],
      }
    );
    return this.client.post('/upload-requests', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
