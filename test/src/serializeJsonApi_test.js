import serializeJsonApi from '../../src/serializeJsonApi';

import outputArrayRelationships from '../fixtures/json_objects/arrayRelationships.json';
import outputArrayNoRelationships from '../fixtures/json_objects/arrayNoRelationships.json';
import outputNoArrayRelationships from '../fixtures/json_objects/noArrayRelationships.json';
import outputNoArrayNoRelationships from '../fixtures/json_objects/noArrayNoRelationships.json';

describe('serializeJsonApi', () => {
  describe('if object is an array', () => {
    it('it returns data in an array', () => {
      const serializedObject = serializeJsonApi(
        [
          { id: '12', siteName: 'Blog', secondAttr: 'example' },
          { id: '13', siteName: 'Blog' },
        ],
        {
          type: 'site',
          attributes: ['siteName', 'secondAttr'],
        }
      );
      expect(serializedObject).to.eql(outputArrayNoRelationships);
    });

    it('it returns relationships', () => {
      const serializedObject = serializeJsonApi(
        [
          { id: '12', siteName: 'Blog', account: '88', authors: ['81', '84'] },
          { id: '13', siteName: 'Blog', authors: '81' },
        ],
        {
          type: 'site',
          attributes: ['siteName', 'secondAttr'],
          requiredAttributes: [],
          relationships: { account: 'account', authors: 'user' },
        }
      );
      expect(serializedObject).to.eql(outputArrayRelationships);
    });
  });

  describe('if data is not an array', () => {
    it('it returns an object', () => {
      const serializedObject = serializeJsonApi(
        {
          id: '12',
          siteName: 'Blog',
          secondAttr: 'example',
        },
        {
          type: 'site',
          attributes: ['siteName', 'secondAttr'],
        }
      );
      expect(serializedObject).to.eql(outputNoArrayNoRelationships);
    });

    it('it returns relationships', () => {
      const serializedObject = serializeJsonApi(
        {
          id: '12',
          siteName: 'Blog',
          authors: ['81', '84'],
        },
        {
          type: 'site',
          attributes: ['siteName'],
          requiredAttributes: [],
          relationships: { account: 'account', authors: 'user' },
        }
      );
      expect(serializedObject).to.eql(outputNoArrayRelationships);
    });
  });
});
