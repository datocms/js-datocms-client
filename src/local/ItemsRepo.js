import pluralize from 'pluralize';
import { camelize } from 'humps';
import Item from './Item';
import Site from './Site';

function buildCollectionsByType(repo, itemTypeMethods) {
  const collectionsByType = {};
  const itemsById = {};
  const itemsByParentId = {};

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

    if (entity.parentId) {
      itemsByParentId[entity.parentId] = itemsByParentId[entity.parentId] || [];
      itemsByParentId[entity.parentId].push(item);
    }
  });

  repo.itemTypes.forEach((itemType) => {
    const method = itemTypeMethods[itemType.apiKey];

    if (!itemType.singleton && itemType.sortable) {
      collectionsByType[method] = collectionsByType[method]
        .sort((a, b) => a.position - b.position);
    } else if (itemType.orderingField) {
      const field = camelize(itemType.orderingField.apiKey);
      const direction = itemType.orderingDirection === 'asc' ? 1 : -1;
      collectionsByType[method] = collectionsByType[method]
        .sort((a, b) => (a[field] - b[field]) * direction);
    }
  });

  repo.itemTypes.forEach((itemType) => {
    const method = itemTypeMethods[itemType.apiKey];

    if (itemType.singleton && itemType.singletonItem) {
      collectionsByType[method] = itemsById[itemType.singletonItem.id];
    }
  });

  return { collectionsByType, itemsById, itemsByParentId };
}

function buildItemTypeMethods(repo) {
  const result = {};

  const singletonKeys = repo.singleInstanceItemTypes.map(t => t.apiKey);
  const collectionKeys = repo.collectionItemTypes.map(t => pluralize(t.apiKey));
  const clashingKeys = singletonKeys.filter(k => collectionKeys.includes(k));

  repo.itemTypes.forEach((itemType) => {
    const { singleton, modularBlock } = itemType;

    if (modularBlock) {
      return;
    }

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
  const {
    collectionsByType,
    itemsById,
    itemsByParentId,
  } = buildCollectionsByType(repo, itemTypeMethods);

  return {
    collectionsByType,
    itemsById,
    itemTypeMethods,
    itemsByParentId,
  };
}

export default class ItemsRepo {
  constructor(entitiesRepo) {
    this.entitiesRepo = entitiesRepo;

    const {
      collectionsByType,
      itemsById,
      itemTypeMethods,
      itemsByParentId,
    } = buildCache(this);

    this.collectionsByType = collectionsByType;
    this.itemsById = itemsById;
    this.itemsByParentId = itemsByParentId;
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
    return new Site(this.entitiesRepo.site, this);
  }

  get itemTypes() {
    return this.entitiesRepo.findEntitiesOfType('item_type');
  }

  get singleInstanceItemTypes() {
    return this.itemTypes.filter(t => t.singleton);
  }

  get collectionItemTypes() {
    return this.itemTypes
      .filter(t => !t.singleton && !t.modularBlock);
  }

  find(id) {
    return this.itemsById[id];
  }

  childrenOf(id) {
    return this.itemsByParentId[id] || [];
  }

  itemsOfType(itemType) {
    const method = this.itemTypeMethods[itemType.apiKey];

    if (itemType.singleton) {
      const item = this.collectionsByType[method];
      return [item];
    }

    return this.collectionsByType[method];
  }
}
