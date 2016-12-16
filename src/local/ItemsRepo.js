import pluralize from 'pluralize';
import { camelize } from 'humps';
import Item from './Item';
import Site from './Site';

function buildCollectionsByType(repo, itemTypeMethods) {
  const collectionsByType = {};
  const itemsById = {};

  repo.itemTypes.forEach((itemType) => {
    const method = itemTypeMethods[itemType.apiKey];
    collectionsByType[method] = itemType.singleton ? null : [];
  });

  repo.entitiesRepo.findEntitiesOfType('item').forEach((entity) => {
    const item = new Item(entity, repo);
    const method = itemTypeMethods[entity.itemType.apiKey];

    if (!entity.itemType.singleton) {
      collectionsByType[method].push(item);
    }

    itemsById[item.id] = item;
  });

  repo.itemTypes.forEach((itemType) => {
    const method = itemTypeMethods[itemType.apiKey];
    if (!itemType.singleton && itemType.sortable) {
      collectionsByType[method] = collectionsByType[method]
        .sort((a, b) => a.position - b.position);
    }
  });

  repo.itemTypes.forEach((itemType) => {
    const method = itemTypeMethods[itemType.apiKey];

    if (itemType.singleton && itemType.singletonItem) {
      collectionsByType[method] = itemsById[itemType.singletonItem.id];
    }
  });

  return { collectionsByType, itemsById };
}

function buildItemTypeMethods(repo) {
  const result = {};

  const singletonKeys = repo.singleInstanceItemTypes.map(t => t.apiKey);
  const collectionKeys = repo.collectionItemTypes.map(t => pluralize(t.apiKey));
  const clashingKeys = singletonKeys.filter(k => collectionKeys.includes(k));

  repo.itemTypes.forEach((itemType) => {
    const { singleton } = itemType;
    const pluralizedApiKey = pluralize(itemType.apiKey);

    let method = camelize(singleton ? itemType.apiKey : pluralizedApiKey);

    if (clashingKeys.includes(pluralizedApiKey)) {
      const suffix = singleton ? 'Instance' : 'Collection';
      method += suffix;
    }

    result[itemType.apiKey] = method;
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

    Object.values(itemTypeMethods).forEach((method) => {
      Object.defineProperty(this, method, {
        get() {
          return collectionsByType[method];
        },
      });
    });
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

