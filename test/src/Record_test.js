import Record from '../../src/Record';
import RecordsRepo from '../../src/RecordsRepo';
import EntitiesRepo from '../../src/EntitiesRepo';

import spaceFixture from '../fixtures/space.json';
import recordsFixture from '../fixtures/records.json';

describe('Record', () => {
  let record;

  const entitiesRepo = new EntitiesRepo(spaceFixture, recordsFixture);
  const recordsRepo = new RecordsRepo(null, entitiesRepo);
  const entity = entitiesRepo.findEntity('record', '9288');

  beforeEach(() => {
    record = new Record(entity, recordsRepo);
  });

  it('id, contentType, isSingleton, position are properly configured', () => {
    expect(record.id).to.equal('9288');
    expect(record.contentType.api_key).to.equal('post');
  });

  it('uses locale to get the proper attribute value', () => {
    recordsRepo.locale = 'it';
    expect(record.title).to.equal('Il mio titolo');
    recordsRepo.locale = 'en';
    expect(record.title).to.equal('My titlè');
  });

  it('with complex values, it returns an object', () => {
    expect(record.image.url()).to.include('https://dato-images.imgix.net');
  });

  describe('slug', () => {
    it('returns a parameterized title', () => {
      expect(record.slug).to.equal('9288-my-title');
    });
  });
});

