import Item from '../../src/Item';
import ItemsRepo from '../../src/ItemsRepo';
import EntitiesRepo from '../../src/EntitiesRepo';

import siteFixture from '../fixtures/site.json';
import itemsFixture from '../fixtures/items.json';

describe('Item', () => {
  let item;

  const entitiesRepo = new EntitiesRepo(siteFixture, itemsFixture);
  const itemsRepo = new ItemsRepo(null, entitiesRepo);
  const entity = entitiesRepo.findEntity('item', '9288');

  beforeEach(() => {
    item = new Item(entity, itemsRepo);
  });

  it('id, itemType, isSingleton, position are properly configured', () => {
    expect(item.id).to.equal('9288');
    expect(item.itemType.api_key).to.equal('post');
  });

  it('uses locale to get the proper attribute value', () => {
    itemsRepo.locale = 'it';
    expect(item.title).to.equal('Il mio titolo');
    itemsRepo.locale = 'en';
    expect(item.title).to.equal('My titlè');
  });

  it('with complex values, it returns an object', () => {
    expect(item.image.url()).to.include('https://dato-images.imgix.net');
  });

  describe('slug', () => {
    it('returns a parameterized title', () => {
      expect(item.slug).to.equal('9288-my-title');
    });
  });
});

