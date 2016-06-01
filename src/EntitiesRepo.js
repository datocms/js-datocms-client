import Entity from './Entity';

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

    payloads.forEach(payload => {
      payloadEntities(payload).forEach(entityPayload => {
        const object = new Entity(entityPayload, this);
        this.entities[object.type] = this.entities[object.type] || {};
        this.entities[object.type][object.id] = object;
      });
    });
  }

  findEntitiesOfType(type) {
    return Object.values(this.entities[type] || {});
  }

  findEntity(type, id) {
    return this.entities[type][id];
  }
}

