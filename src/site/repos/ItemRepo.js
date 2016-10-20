import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

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
    ['id', 'updatedAt', 'isValid', 'itemType'].forEach((key) => {
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

  all(params = {}) {
    return this.client.get('/items', params)
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
