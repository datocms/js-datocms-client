import { decamelizeKeys, camelize } from 'humps';
import diff from 'arr-diff';

const linkAttributes = schema => schema.properties.data.properties.attributes;
const requiredAttributes = schema => (linkAttributes(schema).required || []);
const hasKey = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

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
      const camelizedRelationship = camelize(relationship);

      if (relationship !== camelizedRelationship && hasKey(unserializedBody, relationship)
        && hasKey(unserializedBody, camelizedRelationship)) {
        throw new Error(`Attribute ${camelizedRelationship} is expressed both in camel-case and snake-case`);
      }

      if (hasKey(unserializedBody, camelizedRelationship)
        || hasKey(unserializedBody, relationship)) {
        const value = unserializedBody[camelizedRelationship]
          || unserializedBody[relationship];

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

        if (relationship !== camelizedRelationship && hasKey(unserializedBody, relationship)) {
          console.warn(`Warning: Attribute ${relationship} should be expressed in camel-case syntax (${camelizedRelationship})`);
        }

        return Object.assign(acc, { [relationship]: { data } });
      }

      if (requiredRelationships(schema).includes(relationship)) {
        throw new Error(`Required attribute: ${camelizedRelationship}`);
      }

      return Object.assign(acc, { [relationship]: { data: null } });
    }, {});
}

function serializedAttributes(type, unserializedBody = {}, schema) {
  const attrs = type === 'item'
    ? diff(
      Object.keys(decamelizeKeys(unserializedBody)),
      [
        'item_type', 'id', 'created_at', 'updated_at', 'is_valid',
        'published_version', 'current_version',
      ],
    )
    : Object.keys(linkAttributes(schema).properties);

  return attrs.reduce((acc, attr) => {
    const camelizedAttr = camelize(attr);

    if (attr !== camelizedAttr
      && hasKey(unserializedBody, attr)
      && hasKey(unserializedBody, camelizedAttr)) {
      throw new Error(`Attribute ${camelizedAttr} is expressed both in camel-case and snake-case`);
    }

    if (attr !== camelizedAttr && hasKey(unserializedBody, attr)) {
      console.warn(`Warning: Attribute ${attr} should be expressed in camel-case syntax (${camelizedAttr})`);
      return Object.assign(acc, { [attr]: unserializedBody[attr] });
    }

    if (hasKey(unserializedBody, camelizedAttr)) {
      return Object.assign(acc, { [attr]: unserializedBody[camelizedAttr] });
    }

    if (requiredAttributes(schema).includes(attr)) {
      throw new Error(`Required attribute: ${camelizedAttr}`);
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
