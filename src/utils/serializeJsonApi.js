import diff from 'arr-diff';
import omit from 'object.omit';
import { decamelizeKeys, camelize } from './keyFormatter';
import findInfoForProperty from './findInfoForProperty';
import jsonSchemaRelationships from './jsonSchemaRelationships';
import {
  jsonSchemaPropertyRequired,
  jsonSchemaValueRequired,
} from './jsonSchemaRequired';

const findAttributes = (schema) => {
  const info = findInfoForProperty('attributes', schema);

  if (info && info.properties) {
    return Object.keys(info.properties);
  }

  return [];
};

const attributeProperties = (schema, attribute) => {
  const info = findInfoForProperty('attributes', schema);

  if (info && info.properties) {
    return info.properties[attribute];
  }

  return null;
};

const hasKey = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

function serializedRelationships(type, unserializedBody, schema) {
  return jsonSchemaRelationships(schema).reduce((acc, { relationship, collection, types }) => {
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
        if (types.length > 1) {
          data = value;
        } else if (collection) {
          data = value.map(id => ({ type: types[0], id }));
        } else {
          data = { type: types[0], id: value };
        }
      } else {
        if (jsonSchemaValueRequired('relationships', schema).includes(relationship)) {
          throw new Error(`Required relationship: ${camelizedRelationship}`);
        }

        data = null;
      }

      if (relationship !== camelizedRelationship && hasKey(unserializedBody, relationship)) {
        console.warn(`Warning: Attribute ${relationship} should be expressed in camel-case syntax (${camelizedRelationship})`);
      }

      return Object.assign(acc, { [relationship]: { data } });
    }

    if (jsonSchemaPropertyRequired('relationships', schema).includes(relationship)) {
      if (jsonSchemaValueRequired('relationships', schema).includes(relationship)) {
        throw new Error(`Required relationship: ${camelizedRelationship}`);
      }

      return Object.assign(acc, { [relationship]: { data: null } });
    }

    return acc;
  }, {});
}

function serializedAttributes(type, unserializedBody = {}, schema) {
  const attrs = type === 'item'
    ? diff(
      Object.keys(decamelizeKeys(unserializedBody)),
      ['item_type', 'id', 'created_at', 'updated_at', 'creator'],
    )
    : findAttributes(schema);

  return attrs.reduce((acc, attr) => {
    const camelizedAttr = camelize(attr);

    const properties = attributeProperties(schema, attr);

    const decamelizeKeysIfRequired = obj => (
      !properties || !properties.keepOriginalCaseOnKeys
        ? decamelizeKeys(obj) : obj
    );

    if (attr !== camelizedAttr
      && hasKey(unserializedBody, attr)
      && hasKey(unserializedBody, camelizedAttr)) {
      throw new Error(`Attribute ${camelizedAttr} is expressed both in camel-case and snake-case`);
    }

    if (attr !== camelizedAttr && hasKey(unserializedBody, attr)) {
      console.warn(`Warning: Attribute ${attr} should be expressed in camel-case syntax (${camelizedAttr})`);
      return Object.assign(
        acc,
        { [attr]: decamelizeKeysIfRequired(unserializedBody[attr]) },
      );
    }

    if (hasKey(unserializedBody, camelizedAttr)) {
      return Object.assign(
        acc,
        { [attr]: decamelizeKeysIfRequired(unserializedBody[camelizedAttr]) },
      );
    }

    if (jsonSchemaPropertyRequired('attributes', schema).includes(attr)) {
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

    const bodyWithoutMeta = hasKey(unserializedBody, 'meta')
      ? omit(unserializedBody, ['meta'])
      : unserializedBody;

    data.attributes = serializedAttributes(type, bodyWithoutMeta, link.schema);

    if (jsonSchemaRelationships(link.schema).length > 0) {
      data.relationships = serializedRelationships(
        type,
        bodyWithoutMeta,
        link.schema,
      );
    }

    return { data };
  }

  throw new Error('Invalid arguments');
}
