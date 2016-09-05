import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class MenuItemRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'menu_item',
        attributes: [
          'label',
          'position',
        ],
        requiredAttributes: [
          'label',
          'position',
        ],
        relationships: {
          itemType: 'item_type',
          parent: 'menu_item',
        },
      }
    );
    return this.client.post('/menu-items', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(menuItemId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      menuItemId,
      resourceAttributes,
      {
        type: 'menu_item',
        attributes: [
          'label',
          'position',
        ],
        requiredAttributes: [
          'label',
          'position',
        ],
        relationships: {
          itemType: 'item_type',
          parent: 'menu_item',
        },
      }
    );
    return this.client.put(`/menu-items/${menuItemId}`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  all() {
    return this.client.get('/menu-items')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find(menuItemId) {
    return this.client.get(`/menu-items/${menuItemId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(menuItemId) {
    return this.client.delete(`/menu-items/${menuItemId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
