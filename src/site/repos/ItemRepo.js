import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

function times(n) {
  /* eslint-disable prefer-spread */
  return Array.apply(null, { length: n }).map(Number.call, Number);
  /* eslint-enable prefer-spread */
}

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

  all(params = {}, deserializeResponse = true) {
    const itemsPerPage = 500;

    return this.client.get(
      '/items',
      Object.assign({}, params, { 'page[limit]': itemsPerPage })
    )
    .then((baseResponse) => {
      const pages = Math.ceil(baseResponse.meta.totalCount / itemsPerPage);

      const extraFetches = times(pages - 1)
      .map((extraPage) => {
        return this.client.get(
          '/items',
          Object.assign({}, params, {
            'page[offset]': itemsPerPage * (extraPage + 1),
            'page[limit]': itemsPerPage,
          })
        ).then(response => response.data);
      });

      return Promise.all(extraFetches).then(x => [x, baseResponse]);
    })
    .then(([datas, baseResponse]) => {
      return Object.assign(
        {}, baseResponse,
        {
          data: baseResponse.data.concat(...datas),
        }
      );
    })
    .then(response => Promise.resolve(
      deserializeResponse ?
        deserializeJsonApi(response) :
        response
    ));
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
