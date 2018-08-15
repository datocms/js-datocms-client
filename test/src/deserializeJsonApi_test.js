import deserializeJsonApi from '../../src/utils/deserializeJsonApi';

import arrayRelationships from '../fixtures/json_objects/arrayRelationships.json';
import arrayNoRelationships from '../fixtures/json_objects/arrayNoRelationships.json';
import noArrayRelationships from '../fixtures/json_objects/noArrayRelationships.json';
import noArrayNoRelationships from '../fixtures/json_objects/noArrayNoRelationships.json';

describe('deserializeJsonApi', () => {
  describe('if data is an array', () => {
    it('it returns an array of objects', () => {
      const deserializedObject = deserializeJsonApi(arrayRelationships);
      expect(deserializedObject).to.eql([
        {
          id: '12', siteName: 'Blog', account: '88', authors: ['81', '84'],
        },
        {
          id: '13', siteName: 'Blog', account: null, authors: '81',
        },
      ]);
    });

    it('it doesn\'t returns relationships', () => {
      const deserializedObject = deserializeJsonApi(arrayNoRelationships);
      expect(deserializedObject).to.eql([
        { id: '12', siteName: 'Blog', secondAttr: 'example' },
        { id: '13', siteName: 'Blog' },
      ]);
    });
  });

  describe('if data is not an array', () => {
    it('it returns an object', () => {
      const deserializedObject = deserializeJsonApi(noArrayNoRelationships);
      expect(deserializedObject).to.eql({
        id: '12',
        siteName: 'Blog',
        secondAttr: 'example',
      });
    });

    it('it returns relationships', () => {
      const deserializedObject = deserializeJsonApi(noArrayRelationships);
      expect(deserializedObject).to.eql({
        id: '12',
        siteName: 'Blog',
        authors: ['81', '84'],
        account: null,
      });
    });
  });
});
