import JsonApiEntity from './JsonApiEntity';

function payloadEntities(payload) {
  const accumulator = [];

  if (payload.data) {
    if (Array.isArray(payload.data)) {
      accumulator.push(...payload.data);
    } else {
      accumulator.push(payload.data);
    }
  }

  if (payload.included) {
    accumulator.push(...payload.included);
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

  upsertEntities(...payloads) {
    const entities = [];

    payloads.forEach((payload) => {
      payloadEntities(payload).forEach((entityPayload) => {
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

    ids.forEach((id) => {
      if (this.entities[type] && this.entities[type][id]) {
        entities.push(this.entities[type][id]);
        delete this.entities[type][id];
      }
    });

    this.destroyListeners.forEach(cb => entities.forEach(cb));
  }

  destroyItemType(id) {
    const itemIds = Object.values(this.entitiesRepo.entities.item)
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
