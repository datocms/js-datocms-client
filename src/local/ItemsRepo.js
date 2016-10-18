import Item from './Item';
import Site from './Site';
import pluralize from 'pluralize';
import { camelize } from 'humps';

function buildCollectionsByType(repo, itemTypeMethods) {
  const collectionsByType = {};
  const itemsById = {};

  repo.itemTypes.forEach(itemType => {
    const { method, singleton } = itemTypeMethods[itemType.apiKey];
    collectionsByType[method] = singleton ? null : [];
  });

  repo.entitiesRepo.findEntitiesOfType('item').forEach(entity => {
    const item = new Item(entity, repo);
    const { method, singleton } = itemTypeMethods[entity.itemType.apiKey];

    if (singleton) {
      collectionsByType[method] = item;
    } else {
      collectionsByType[method].push(item);
    }

    itemsById[item.id] = item;
  });

  return { collectionsByType, itemsById };
}

function buildItemTypeMethods(repo) {
  const result = {};

  const singletonKeys = repo.singleInstanceItemTypes.map(t => t.apiKey);
  const collectionKeys = repo.collectionItemTypes.map(t => pluralize(t.apiKey));
  const clashingKeys = singletonKeys.filter(k => collectionKeys.includes(k));

  repo.itemTypes.forEach(itemType => {
    const { singleton } = itemType;
    const pluralizedApiKey = pluralize(itemType.apiKey);

    let method = camelize(singleton ? itemType.apiKey : pluralizedApiKey);

    if (clashingKeys.includes(pluralizedApiKey)) {
      const suffix = singleton ? 'Instance' : 'Collection';
      method = method + suffix;
    }

    result[itemType.apiKey] = { method, singleton };
  });

  return result;
}

function buildCache(repo) {
  const itemTypeMethods = buildItemTypeMethods(repo);
  const { collectionsByType, itemsById } = buildCollectionsByType(repo, itemTypeMethods);
  return { collectionsByType, itemsById, itemTypeMethods };
}

export default class ItemsRepo {
  constructor(entitiesRepo) {
    this.entitiesRepo = entitiesRepo;

    const {
      collectionsByType,
      itemsById,
      itemTypeMethods,
    } = buildCache(this);

    this.collectionsByType = collectionsByType;
    this.itemsById = itemsById;
    this.itemTypeMethods = itemTypeMethods;

    for (const { method } of Object.values(itemTypeMethods)) {
      Object.defineProperty(this, method, {
        get() {
          return collectionsByType[method];
        },
      });
    }
  }

  get site() {
    return new Site(this.entitiesRepo.findEntitiesOfType('site')[0]);
  }

  get itemTypes() {
    return this.entitiesRepo.findEntitiesOfType('item_type');
  }

  get singleInstanceItemTypes() {
    return this.itemTypes.filter(t => t.singleton);
  }

  get collectionItemTypes() {
    return this.itemTypes.filter(t => !t.singleton);
  }

  find(id) {
    return this.itemsById[id];
  }

  itemsOfType(itemType) {
    const { method, singleton } = this.itemTypeMethods[itemType.apiKey];

    if (singleton) {
      const item = this.collectionsByType[method];
      return [item];
    }

    return this.collectionsByType[method];
  }
}

