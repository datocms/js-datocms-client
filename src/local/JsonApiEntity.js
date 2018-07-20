export default class JsonApiEntity {
  constructor(payload, repo) {
    this.payload = payload;
    this.repo = repo;

    Object.entries(payload.attributes || {}).forEach(([name, value]) => {
      Object.defineProperty(this, name, { enumerable: true, value });
    });

    Object.entries(payload.relationships || {}).forEach(([name, value]) => {
      Object.defineProperty(this, name, {
        enumerable: true,
        get() {
          const linkage = value.data;

          if (Array.isArray(linkage)) {
            return linkage.map(item => repo.findEntity(item.type, item.id));
          } if (linkage) {
            return repo.findEntity(linkage.type, linkage.id);
          }

          return null;
        },
      });
    });
  }

  get id() {
    return this.payload.id;
  }

  get type() {
    return this.payload.type;
  }
}
