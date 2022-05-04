import JsonApiEntity from './JsonApiEntity';

const entitiesToStorePerCacheKey = 5000;

function payloadEntities(payload) {
  let accumulator = [];

  if (payload.data) {
    if (Array.isArray(payload.data)) {
      accumulator = [...accumulator, ...payload.data];
    } else {
      accumulator.push(payload.data);
    }
  }

  if (payload.included) {
    accumulator = [...accumulator, ...payload.included];
  }

  return accumulator;
}

export default class EntitiesRepo {
  constructor(...payloads) {
    this.entities = {};
    this.destroyListeners = [];
    this.upsertListeners = [];
    this.upsertEntities(...payloads);
  }

  async saveStateToCache(cache, cachePrefixKey) {
    const entityTypes = Object.keys(this.entities);

    const manifest = { entityTypeChunkKeys: {} };

    for (const entityType of entityTypes) {
      const entities = Object.values(this.entities[entityType]);

      for (
        let i = 0, chunkIndex = 0;
        i < entities.length;
        i += entitiesToStorePerCacheKey, chunkIndex += 1
      ) {
        const chunkCacheKey = `${cachePrefixKey}--${entityType}-${chunkIndex}`;

        manifest.entityTypeChunkKeys[entityType] =
          manifest.entityTypeChunkKeys[entityType] || [];
        manifest.entityTypeChunkKeys[entityType].push(chunkCacheKey);

        await cache.set(
          chunkCacheKey,
          entities
            .slice(i, i + entitiesToStorePerCacheKey)
            .map(entity => entity.payload),
        );
      }
    }

    await cache.set(cachePrefixKey, manifest);
  }

  async loadStateFromCache(cache, cachePrefixKey) {
    const manifest = await cache.get(cachePrefixKey);

    if (!manifest) {
      return;
    }

    this.entities = {};

    for (const [entityType, entityTypeChunkKeys] of Object.entries(
      manifest.entityTypeChunkKeys,
    )) {
      this.entities[entityType] = {};

      for (const entityTypeChunkKey of entityTypeChunkKeys) {
        const chunkEntities = await cache.get(entityTypeChunkKey);
        chunkEntities.forEach(entityPayload => {
          this.entities[entityType][entityPayload.id] = new JsonApiEntity(
            entityPayload,
            this,
          );
        });
      }
    }
  }

  serializeState() {
    return Object.entries(this.entities).reduce((acc, [type, entitiesById]) => {
      return {
        ...acc,
        [type]: Object.entries(entitiesById).reduce((acc2, [id, entity]) => {
          return {
            ...acc2,
            [id]: entity.payload,
          };
        }, {}),
      };
    }, {});
  }

  loadState(serializedState) {
    this.entities = Object.entries(serializedState).reduce(
      (acc, [type, entitiesById]) => {
        return {
          ...acc,
          [type]: Object.entries(entitiesById).reduce((acc2, [id, payload]) => {
            return {
              ...acc2,
              [id]: new JsonApiEntity(payload, this),
            };
          }, {}),
        };
      },
      {},
    );
  }

  addDestroyListener(cb) {
    this.destroyListeners.push(cb);
    return () => {
      this.destroyListeners = this.destroyListeners.filter(x => x !== cb);
    };
  }

  addUpsertListener(cb) {
    this.upsertListeners.push(cb);
    return () => {
      this.upsertListeners = this.upsertListeners.filter(x => x !== cb);
    };
  }

  destroyAllEntities() {
    // Order is important here! See ie. gatsby-source-datocms `destroyEntityNode` function!
    ['item', 'field', 'item_type', 'upload', 'site'].forEach(type => {
      if (this.entities[type]) {
        this.destroyEntities(type, Object.keys(this.entities[type]));
      }
    });
  }

  upsertEntities(...payloads) {
    const entities = [];

    payloads.forEach(payload => {
      payloadEntities(payload).forEach(entityPayload => {
        const entity = new JsonApiEntity(entityPayload, this);
        entities.push(entity);
        this.entities[entity.type] = this.entities[entity.type] || {};
        this.entities[entity.type][entity.id] = entity;
      });
    });

    this.upsertListeners.forEach(cb => entities.forEach(cb));
  }

  destroyEntities(type, ids) {
    const entities = [];

    ids.forEach(id => {
      if (this.entities[type] && this.entities[type][id]) {
        entities.push(this.entities[type][id]);
        delete this.entities[type][id];
      }
    });

    this.destroyListeners.forEach(cb => entities.forEach(cb));
  }

  destroyItemType(id) {
    const itemIds = Object.values(this.entities.item)
      .filter(item => item.itemType.id === id)
      .map(item => item.id);

    this.entitiesRepo.destroyEntities('item', itemIds);
    this.entitiesRepo.destroyEntities('item_type', [id]);
  }

  get site() {
    return this.findEntitiesOfType('site')[0];
  }

  findEntitiesOfType(type) {
    return Object.values(this.entities[type] || {});
  }

  findEntity(type, id) {
    return this.entities[type] && this.entities[type][id];
  }
}
