import EntitiesRepo from './EntitiesRepo';
import ItemsRepo from './ItemsRepo';

export default class Loader {
  constructor(client, previewMode = false) {
    this.client = client;
    this.previewMode = previewMode;
  }

  load() {
    return Promise.all([
      this.client.get('/site', { include: 'item_types,item_types.fields' }),
      this.client.items.all(
        { version: this.previewMode ? 'latest' : 'published' },
        { deserializeResponse: false, allPages: true },
      ),
      this.client.uploads.all(
        { 'filter[type]': 'used' },
        { deserializeResponse: false, allPages: true },
      ),
    ])
      .then(([site, allItems, allUploads]) => {
        this.entitiesRepo = new EntitiesRepo(site, allItems, allUploads);
        this.itemsRepo = new ItemsRepo(this.entitiesRepo);
      });
  }
}
