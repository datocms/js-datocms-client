import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class SiteRepo {
  constructor(client) {
    this.client = client;
  }

  find(siteId) {
    return this.client.get(`/sites/${siteId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  all() {
    return this.client.get('/sites')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'site',
        attributes: [
          'name',
          'internalSubdomain',
          'domain',
          'notes',
          'template',
        ],
      }
    );
    return this.client.post('/sites', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(siteId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      siteId,
      resourceAttributes,
      {
        type: 'site',
        attributes: [
          'name',
          'domain',
          'internalSubdomain',
          'notes',
        ],
      }
    );
    return this.client.put(`/sites/${siteId}`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(siteId) {
    return this.client.delete(`/sites/${siteId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  duplicate(siteId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'site',
        attributes: [
          'name',
        ],
      }
    );
    return this.client.post(`/sites/${siteId}/duplicate`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
