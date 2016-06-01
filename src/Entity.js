export default class Entity {
  constructor(payload, repo) {
    this.payload = payload;
    this.repo = repo;

    Object.entries(payload.attributes).forEach(([name, value]) => {
      Object.defineProperty(this, name, { value });
    });

    Object.entries(payload.relationships).forEach(([name, value]) => {
      Object.defineProperty(this, name, {
        get() {
          const linkage = value.data;

          if (Array.isArray(linkage)) {
            return linkage.map(item => repo.findEntity(item.type, item.id));
          } else {
            return repo.findEntity(linkage.type, linkage.id);
          }
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
