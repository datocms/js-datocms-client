import EntitiesRepo from '../local/EntitiesRepo';
import ItemsRepo from '../local/ItemsRepo';

function times(n) {
  /* eslint-disable prefer-spread */
  return Array.apply(null, { length: n }).map(Number.call, Number);
  /* eslint-enable prefer-spread */
}

export default class Loader {
  constructor(client) {
    this.client = client;
  }

  load() {
    return Promise.all([
      this.fetchSite(),
      this.fetchAllItems(),
    ])
    .then(([site, allItems]) => {
      this.entitiesRepo = new EntitiesRepo(site, allItems);
      this.itemsRepo = new ItemsRepo(this.entitiesRepo);
    });
  }

  fetchSite() {
    return this.client.get('/site', { include: 'item_types,item_types.fields' });
  }

  fetchAllItems() {
    const itemsPerPage = 500;

    return this.client.get('/items', { 'page[limit]': itemsPerPage })
    .then((baseResponse) => {
      const pages = Math.ceil(baseResponse.meta.total_count / itemsPerPage);

      const extraFetches = times(pages - 1)
      .map((extraPage) => {
        return this.client.get(
          '/items',
          {
            'page[offset]': itemsPerPage * (extraPage + 1),
            'page[limit]': itemsPerPage,
          }
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
    });
  }
}
