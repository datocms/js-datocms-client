import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';
import fetchAllPages from '../fetchAllPages';

export default class ItemRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const attributeKeys = Object.keys(resourceAttributes);
    ['id', 'itemType'].forEach((key) => {
      const index = attributeKeys.indexOf(key);
      if (index > -1) {
        attributeKeys.splice(index, 1);
      }
    });

    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'item',
        attributes: attributeKeys,
        requiredAttributes: [],
        relationships: {
          itemType: 'item_type',
        },
        requiredRelationships: ['itemType'],
      }
    );
    return this.client.post('/items', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(itemId, resourceAttributes) {
    const attributeKeys = Object.keys(resourceAttributes);
    ['id', 'createdAt', 'updatedAt', 'isValid', 'itemType', 'currentVersion', 'publishedVersion'].forEach((key) => {
      const index = attributeKeys.indexOf(key);
      if (index > -1) {
        attributeKeys.splice(index, 1);
      }
    });

    const serializedResource = serializeJsonApi(
      itemId,
      resourceAttributes,
      {
        type: 'item',
        attributes: attributeKeys,
      }
    );
    return this.client.put(`/items/${itemId}`, serializedResource)
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
      request = fetchAllPages(this.client, '/items', params);
    } else {
      request = this.client.get('/items', params);
    }

    return request
    .then(response => Promise.resolve(
      deserializeResponse ?
        deserializeJsonApi(response) :
        response
    ));
  }

  publish(itemId) {
    return this.client.put(`/items/${itemId}/publish`, {})
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  unpublish(itemId) {
    return this.client.put(`/items/${itemId}/unpublish`, {})
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find(itemId) {
    return this.client.get(`/items/${itemId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(itemId) {
    return this.client.delete(`/items/${itemId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
