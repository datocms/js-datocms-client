import diff from 'arr-diff';
import omit from 'object.omit';
import { decamelizeKeys, camelize } from './keyFormatter';
import findInfoForProperty from './findInfoForProperty';
import jsonSchemaRelationships from './jsonSchemaRelationships';
import jsonSchemaType from './jsonSchemaType';
import {
  jsonSchemaGroupPropertyRequired,
  jsonSchemaPropertyRequired,
  jsonSchemaValueRequired,
} from './jsonSchemaRequired';

const findAttributes = schema => {
  const info = findInfoForProperty('attributes', schema);

  if (info && info.properties) {
    return Object.keys(info.properties);
  }

  return [];
};

const findMetas = schema => {
  const info = findInfoForProperty('meta', schema);

  if (info && info.properties) {
    return Object.keys(info.properties);
  }

  return [];
};

const metaProperties = (schema, meta) => {
  const info = findInfoForProperty('meta', schema);

  if (info && info.properties) {
    return info.properties[meta];
  }

  return null;
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
  const relationships = jsonSchemaRelationships(schema);

  return relationships.reduce((acc, { relationship, collection, types }) => {
    const camelizedRelationship = camelize(relationship);

    if (
      relationship !== camelizedRelationship &&
      hasKey(unserializedBody, relationship) &&
      hasKey(unserializedBody, camelizedRelationship)
    ) {
      throw new Error(
        `Attribute ${camelizedRelationship} is expressed both in camelCase and snake_case`,
      );
    }

    if (
      hasKey(unserializedBody, camelizedRelationship) ||
      hasKey(unserializedBody, relationship)
    ) {
      const value =
        unserializedBody[camelizedRelationship] ||
        unserializedBody[relationship];

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
        if (
          jsonSchemaGroupPropertyRequired(schema).includes('relationships') &&
          jsonSchemaValueRequired('relationships', schema).includes(
            relationship,
          )
        ) {
          throw new Error(`Required relationship: ${camelizedRelationship}`);
        }

        data = null;
      }

      if (
        relationship !== camelizedRelationship &&
        hasKey(unserializedBody, relationship)
      ) {
        console.warn(
          `Warning: Attribute ${relationship} should be expressed in camelCase syntax (${camelizedRelationship})`,
        );
      }

      return Object.assign(acc, { [relationship]: { data } });
    }

    if (
      jsonSchemaGroupPropertyRequired(schema).includes('relationships') &&
      jsonSchemaPropertyRequired('relationships', schema).includes(relationship)
    ) {
      if (
        jsonSchemaValueRequired('relationships', schema).includes(relationship)
      ) {
        throw new Error(`Required relationship: ${camelizedRelationship}`);
      }

      return Object.assign(acc, { [relationship]: { data: null } });
    }

    return acc;
  }, {});
}

export function serializedAttributes(type, unserializedBody = {}, schema) {
  const attrs =
    type === 'item'
      ? diff(Object.keys(decamelizeKeys(unserializedBody)), [
          'item_type',
          'id',
          'created_at',
          'updated_at',
          'creator',
        ])
      : findAttributes(schema);

  return attrs.reduce((acc, attr) => {
    const camelizedAttr = camelize(attr);

    const properties = attributeProperties(schema, attr);

    const decamelizeKeysIfRequired = obj =>
      !properties || !properties.keepOriginalCaseOnKeys
        ? decamelizeKeys(obj)
        : obj;

    if (
      attr !== camelizedAttr &&
      hasKey(unserializedBody, attr) &&
      hasKey(unserializedBody, camelizedAttr)
    ) {
      throw new Error(
        `Attribute ${camelizedAttr} is expressed both in camelCase and snake_case`,
      );
    }

    if (attr !== camelizedAttr && hasKey(unserializedBody, attr)) {
      console.warn(
        `Warning: Attribute ${attr} should be expressed in camelCase syntax (${camelizedAttr})`,
      );
      return Object.assign(acc, {
        [attr]: decamelizeKeysIfRequired(unserializedBody[attr]),
      });
    }

    if (hasKey(unserializedBody, camelizedAttr)) {
      return Object.assign(acc, {
        [attr]: decamelizeKeysIfRequired(unserializedBody[camelizedAttr]),
      });
    }

    if (jsonSchemaPropertyRequired('attributes', schema).includes(attr)) {
      throw new Error(`Required attribute: ${camelizedAttr}`);
    }

    return acc;
  }, {});
}

export function serializedMeta(unserializedMeta = {}, schema) {
  const metas = findMetas(schema);

  if (metas.length === 0) {
    return null;
  }

  return metas.reduce((acc, attr) => {
    const camelizedAttr = camelize(attr);

    const properties = metaProperties(schema, attr);

    const decamelizeKeysIfRequired = obj =>
      !properties || !properties.keepOriginalCaseOnKeys
        ? decamelizeKeys(obj)
        : obj;

    if (
      attr !== camelizedAttr &&
      hasKey(unserializedMeta, attr) &&
      hasKey(unserializedMeta, camelizedAttr)
    ) {
      throw new Error(
        `Meta ${camelizedAttr} is expressed both in camelCase and snake_case`,
      );
    }

    if (attr !== camelizedAttr && hasKey(unserializedMeta, attr)) {
      console.warn(
        `Warning: Meta ${attr} should be expressed in camelCase syntax (${camelizedAttr})`,
      );
      return Object.assign(acc, {
        [attr]: decamelizeKeysIfRequired(unserializedMeta[attr]),
      });
    }

    if (hasKey(unserializedMeta, camelizedAttr)) {
      return Object.assign(acc, {
        [attr]: decamelizeKeysIfRequired(unserializedMeta[camelizedAttr]),
      });
    }

    if (jsonSchemaPropertyRequired('attributes', schema).includes(attr)) {
      throw new Error(`Required meta: ${camelizedAttr}`);
    }

    return acc;
  }, {});
}

export default function serializeJsonApi(unserializedBody, link, itemId) {
  const data = {};

  if (itemId || unserializedBody.id) {
    data.id = itemId || unserializedBody.id;
  }

  const bodyWithoutMeta = hasKey(unserializedBody, 'meta')
    ? omit(unserializedBody, ['meta'])
    : unserializedBody;

  const type = jsonSchemaType(link.schema);

  data.type = type;

  const attributes = serializedAttributes(type, bodyWithoutMeta, link.schema);
  const relationships = serializedRelationships(
    type,
    bodyWithoutMeta,
    link.schema,
  );
  const meta =
    unserializedBody.meta && serializedMeta(unserializedBody.meta, link.schema);

  if (
    jsonSchemaGroupPropertyRequired(link.schema).includes('attributes') ||
    Object.keys(attributes).length > 0
  ) {
    data.attributes = attributes;
  }

  if (
    jsonSchemaGroupPropertyRequired(link.schema).includes('relationships') ||
    Object.keys(relationships).length > 0
  ) {
    data.relationships = relationships;
  }

  if (meta) {
    data.meta = meta;
  }

  return { data };
}
