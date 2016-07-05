import EntitiesRepo from './EntitiesRepo';
import Item from './Item';
import pluralize from 'pluralize';

function itemTypeKey(itemType) {
  const apiKey = itemType.api_key;

  if (itemType.singleton) {
    return [apiKey, true];
  }

  return [pluralize.plural(apiKey), false];
}

function buildCache(entitiesRepo, itemsRepo) {
  const collectionsByType = {};
  const itemsById = {};

  entitiesRepo.findEntitiesOfType('item_type').forEach(itemType => {
    const [key, singleton] = itemTypeKey(itemType);
    collectionsByType[key] = singleton ? null : [];
  });

  entitiesRepo.findEntitiesOfType('item').forEach(itemEntity => {
    const item = new Item(itemEntity, itemsRepo);
    const [key, singleton] = itemTypeKey(itemEntity.item_type);
    if (singleton) {
      collectionsByType[key] = item;
    } else {
      collectionsByType[key].push(item);
    }
    itemsById[item.id] = item;
  });

  return [collectionsByType, itemsById];
}

export default class ItemsRepo {
  constructor(session, entitiesRepo = null) {
    this.locale = 'en';
    this.session = session;
    this.repo = entitiesRepo || new EntitiesRepo();

    const [collectionsByType, itemsById] = buildCache(this.repo, this);
    this.collectionsByType = collectionsByType;
    this.itemsById = itemsById;
  }

  refresh() {
    return Promise.all([
      this.session.getSite({ include: 'item_types,item_types.fields' }),
      this.session.getItems({ 'page[limit]': 10000 }),
    ])
    .then(payloads => {
      this.repo = new EntitiesRepo(...payloads);
      const [collectionsByType, itemsById] = buildCache(this.repo, this);
      this.collectionsByType = collectionsByType;
      this.itemsById = itemsById;
    });
  }

  find(id) {
    return this.itemsById[id];
  }

  itemsOfType(type) {
    return this.collectionsByType[type];
  }

}
