import EntitiesRepo from '../../src/EntitiesRepo';
import spaceFixture from '../fixtures/space.json';
import recordsFixture from '../fixtures/records.json';

describe('EntitiesRepo', () => {
  let repo;

  beforeEach(() => {
    repo = new EntitiesRepo(spaceFixture, recordsFixture);
  });

  describe('findEntitiesOfType', () => {
    it('finds all entities of a certain type', () => {
      expect(repo.findEntitiesOfType('space')).to.have.lengthOf(1);
      expect(repo.findEntitiesOfType('content_type')).to.have.lengthOf(1);
      expect(repo.findEntitiesOfType('record')).to.have.lengthOf(1);
    });
  });

  describe('findEntity', () => {
    it('finds a specific entity', () => {
      expect(repo.findEntity('space', '67').name).to.equal('Foobar');
    });
  });
});

