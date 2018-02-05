import EntitiesRepo from '../local/EntitiesRepo';
import ItemsRepo from '../local/ItemsRepo';

export default class Loader {
  constructor(client) {
    this.client = client;
  }

  load() {
    return Promise.all([
      this.client.get('/site', { include: 'item_types,item_types.fields' }),
      this.client.items.all({}, { deserializeResponse: false, allPages: true }),
    ])
    .then(([site, allItems]) => {
      this.entitiesRepo = new EntitiesRepo(site, allItems);
      this.itemsRepo = new ItemsRepo(this.entitiesRepo);
    });
  }
}
