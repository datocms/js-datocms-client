import { camelize } from 'humps';
import diff from 'arr-diff';

const linkAttributes = schema => schema.properties.data.properties.attributes;
const requiredAttributes = schema => (linkAttributes(schema).required || []);

const linkRelationships = schema => (
  !schema || !schema.properties.data
    ? {}
    : schema.properties.data.properties.relationships
);
const requiredRelationships = schema => (linkRelationships(schema).required || []);

function relationships(type, schema) {
  if (type === 'item') {
    return { item_type: { collection: false, type: 'item_type' } };
  }

  if (!linkRelationships(schema).properties) {
    return {};
  }

  return Object.entries(linkRelationships(schema).properties)
    .reduce((acc, [relationship, relAttributes]) => {
      const isCollection = relAttributes.properties.data.type === 'array';

      const isObject = relAttributes.properties.data.type === 'object';

      let definition;

      if (isCollection) {
        definition = relAttributes.properties.data.items;
      } else if (isObject) {
        definition = relAttributes.properties.data;
      } else {
        definition = relAttributes.properties.data.anyOf
          .find(x => x.type[0] !== 'null');
      }

      const relType = definition.properties.type.pattern
        .replace(new RegExp(/(^\^|\$$)/, 'g'), '');

      return Object.assign(
        acc,
        { [relationship]: { collection: isCollection, type: relType } },
      );
    }, {});
}

function serializedRelationships(type, unserializedBody, schema) {
  return Object.entries(relationships(type, schema))
    .reduce((acc, [relationship, meta]) => {
      if (Object.prototype.hasOwnProperty.call(unserializedBody, camelize(relationship))) {
        const value = unserializedBody[camelize(relationship)];
        let data;

        if (value) {
          if (meta.collection) {
            data = value.map(id => ({ type: meta.type, id }));
          } else {
            data = { type: meta.type, id: value };
          }
        } else {
          data = null;
        }

        return Object.assign(acc, { [relationship]: { data } });
      } if (requiredRelationships(schema).includes(relationship)) {
        throw new Error(`Required attribute: ${relationship}`);
      }

      return Object.assign(acc, { [relationship]: { data: null } });
    }, {});
}

function serializedAttributes(type, unserializedBody = {}, schema) {
  const attrs = type === 'item'
    ? diff(Object.keys(unserializedBody), [
      'itemType', 'id', 'createdAt',
      'updatedAt', 'isValid', 'publishedVersion',
      'currentVersion',
    ])
    : Object.keys(linkAttributes(schema).properties);

  return attrs.reduce((acc, attribute) => {
    if (Object.prototype.hasOwnProperty.call(unserializedBody, camelize(attribute))) {
      return Object.assign(acc, { [attribute]: unserializedBody[camelize(attribute)] });
    } if (requiredAttributes(schema).includes(attribute)) {
      throw new Error(`Required attribute: ${attribute}`);
    }

    return acc;
  }, {});
}

export default function serializeJsonApi(...args) {
  if (args.length === 4 || args.length === 3) {
    const [type, unserializedBody, link, itemId] = args;
    const data = {};

    data.type = type;

    if (itemId || unserializedBody.id) {
      data.id = itemId || unserializedBody.id;
    }

    data.attributes = serializedAttributes(type, unserializedBody, link.schema);

    if (link.schema.properties && linkRelationships(link.schema)) {
      data.relationships = serializedRelationships(type, unserializedBody, link.schema);
    }

    return { data };
  }

  throw new Error('Invalid arguments');
}
