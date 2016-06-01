import RecordsRepo from '../../src/RecordsRepo';
import spaceFixture from '../fixtures/space.json';
import recordsFixture from '../fixtures/records.json';

describe('RecordsRepo', () => {
  let repo;

  const session = {
    getSpace() {
      return Promise.resolve(spaceFixture);
    },
    getRecords() {
      return Promise.resolve(recordsFixture);
    },
  };

  beforeEach(() => {
    repo = new RecordsRepo(session);
  });

  describe('refresh', () => {
    it('makes API calls and fills the entities repo', mochaAsync(async () => {
      await repo.refresh();
    }));
  });
});
