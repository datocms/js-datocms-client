import ItemsRepo from '../../src/ItemsRepo';
import siteFixture from '../fixtures/site.json';
import itemsFixture from '../fixtures/items.json';

describe('ItemsRepo', () => {
  let repo;

  const session = {
    getSite() {
      return Promise.resolve(siteFixture);
    },
    getItems() {
      return Promise.resolve(itemsFixture);
    },
  };

  beforeEach(() => {
    repo = new ItemsRepo(session);
  });

  describe('refresh', () => {
    it('makes API calls and fills the entities repo', mochaAsync(async () => {
      await repo.refresh();
    }));
  });
});
