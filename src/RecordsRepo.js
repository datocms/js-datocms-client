import EntitiesRepo from './EntitiesRepo';

export default class RecordsRepo {
  constructor(session) {
    this.session = session;
    this.repo = new EntitiesRepo();
  }

  refresh() {
    return Promise.all([
      this.session.getSpace({ include: 'content_types,content_types.fields' }),
      this.session.getRecords({ 'page[limit]': 10000 })
    ])
    .then(payloads => {
      this.repo = new EntitiesRepo(...payloads);
    });
  }
}
