import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class FieldRepo {
  constructor(client) {
    this.client = client;
  }

  create(itemTypeId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'field',
        attributes: [
          'label',
          'fieldType',
          'localized',
          'apiKey',
          'hint',
          'validators',
          'appeareance',
          'position',
        ],
        requiredAttributes: [
          'label',
          'fieldType',
          'localized',
          'apiKey',
          'hint',
          'validators',
          'appeareance',
          'position',
        ],
      }
    );
    return this.client.post(`/item-types/${itemTypeId}/fields`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(fieldId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      fieldId,
      resourceAttributes,
      {
        type: 'field',
        attributes: [
          'label',
          'apiKey',
          'localized',
          'validators',
          'appeareance',
          'position',
          'fieldType',
          'hint',
        ],
      }
    );
    return this.client.put(`/fields/${fieldId}`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  all(itemTypeId) {
    return this.client.get(`/item-types/${itemTypeId}/fields`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find(fieldId) {
    return this.client.get(`/fields/${fieldId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(fieldId) {
    return this.client.delete(`/fields/${fieldId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
