import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class ItemTypeRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'item_type',
        attributes: [
          'name',
          'apiKey',
          'singleton',
          'sortable',
          'modularBlock',
          'tree',
          'orderingDirection',
        ],
        requiredAttributes: [
          'name',
          'apiKey',
          'singleton',
          'sortable',
          'modularBlock',
          'tree',
          'orderingDirection',
        ],
        relationships: {
          orderingField: 'field',
        },
        requiredRelationships: [
          'orderingField',
        ],
      }
    );
    return this.client.post('/item-types', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(itemTypeId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      itemTypeId,
      resourceAttributes,
      {
        type: 'item_type',
        attributes: [
          'name',
          'apiKey',
          'singleton',
          'sortable',
          'modularBlock',
          'tree',
          'orderingDirection',
        ],
        requiredAttributes: [
          'name',
          'apiKey',
          'singleton',
          'sortable',
          'modularBlock',
          'tree',
          'orderingDirection',
        ],
        relationships: {
          orderingField: 'field',
        },
        requiredRelationships: [
          'orderingField',
        ],
      }
    );
    return this.client.put(`/item-types/${itemTypeId}`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  all() {
    return this.client.get('/item-types')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find(itemTypeId) {
    return this.client.get(`/item-types/${itemTypeId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  duplicate(itemTypeId) {
    return this.client.post(`/item-types/${itemTypeId}/duplicate`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(itemTypeId) {
    return this.client.delete(`/item-types/${itemTypeId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
