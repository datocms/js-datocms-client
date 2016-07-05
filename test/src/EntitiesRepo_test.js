import EntitiesRepo from '../../src/EntitiesRepo';
import siteFixture from '../fixtures/site.json';
import itemsFixture from '../fixtures/items.json';

describe('EntitiesRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new EntitiesRepo(siteFixture, itemsFixture);
  });

  describe('findEntitiesOfType', () => {
    it('finds all entities of a certain type', () => {
      expect(repo.findEntitiesOfType('site')).to.have.lengthOf(1);
      expect(repo.findEntitiesOfType('item_type')).to.have.lengthOf(1);
      expect(repo.findEntitiesOfType('item')).to.have.lengthOf(1);
    });
  });

  describe('findEntity', () => {
    it('finds a specific entity', () => {
      expect(repo.findEntity('site', '67').name).to.equal('Foobar');
    });
  });
});

