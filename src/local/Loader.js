import EntitiesRepo from '../local/EntitiesRepo';
import ItemsRepo from '../local/ItemsRepo';

export default class Loader {
  constructor(client, draftMode = false) {
    this.client = client;
    this.draftMode = draftMode;
  }

  load() {
    return Promise.all([
      this.client.get('/site', { include: 'item_types,item_types.fields' }),
      this.client.items.all(
        { version: this.draftMode ? 'current' : 'published' },
        { deserializeResponse: false, allPages: true }
      ),
    ])
    .then(([site, allItems]) => {
      this.entitiesRepo = new EntitiesRepo(site, allItems);
      this.itemsRepo = new ItemsRepo(this.entitiesRepo);
    });
  }
}
