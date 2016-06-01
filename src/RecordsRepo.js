import EntitiesRepo from './EntitiesRepo';
import Record from './Record';
import pluralize from 'pluralize';

function contentTypeKey(contentType) {
  const apiKey = contentType.api_key;

  if (contentType.singleton) {
    return [apiKey, true];
  }

  return [pluralize.plural(apiKey), false];
}

function buildCache(entitiesRepo, recordsRepo) {
  const collectionsByType = {};
  const recordsById = {};

  entitiesRepo.findEntitiesOfType('content_type').forEach(contentType => {
    const [key, singleton] = contentTypeKey(contentType);
    collectionsByType[key] = singleton ? null : [];
  });

  entitiesRepo.findEntitiesOfType('record').forEach(recordEntity => {
    const record = new Record(recordEntity, recordsRepo);
    const [key, singleton] = contentTypeKey(recordEntity.content_type);
    if (singleton) {
      collectionsByType[key] = record;
    } else {
      collectionsByType[key].push(record);
    }
    recordsById[record.id] = record;
  });

  return [collectionsByType, recordsById];
}

export default class RecordsRepo {
  constructor(session, entitiesRepo = null) {
    this.locale = 'en';
    this.session = session;
    this.repo = entitiesRepo || new EntitiesRepo();

    const [collectionsByType, recordsById] = buildCache(this.repo, this);
    this.collectionsByType = collectionsByType;
    this.recordsById = recordsById;
  }

  refresh() {
    return Promise.all([
      this.session.getSpace({ include: 'content_types,content_types.fields' }),
      this.session.getRecords({ 'page[limit]': 10000 }),
    ])
    .then(payloads => {
      this.repo = new EntitiesRepo(...payloads);
      const [collectionsByType, recordsById] = buildCache(this.repo, this);
      this.collectionsByType = collectionsByType;
      this.recordsById = recordsById;
    });
  }

  find(id) {
    return this.recordsById[id];
  }

  recordsOfType(type) {
    return this.collectionsByType[type];
  }

}
