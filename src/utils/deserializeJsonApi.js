import { camelize, camelizeKeys } from './keyFormatter';
import jsonSchemaRelationships from './jsonSchemaRelationships';
import findInfoForProperty from './findInfoForProperty';

const hasKey = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

const findKey = (jsonApiKey, schema) => {
  const info = findInfoForProperty(jsonApiKey, schema);

  if (info && info.properties) {
    return Object.entries(info.properties).map(([key, details]) => ({ key, details }));
  }

  return [];
};

const findAttributes = findKey.bind(null, 'attributes');
const findMeta = findKey.bind(null, 'meta');

function deserialize(
  type,
  relationshipsMeta,
  schema,
  {
    id,
    attributes,
    meta,
    relationships,
  },
) {
  const result = { id };

  const attrs = type === 'item'
    ? Object.keys(attributes).map(key => ({ key, details: null }))
    : findAttributes(schema);

  attrs.forEach(({ key, details }) => {
    if (hasKey(attributes, key)) {
      result[camelize(key)] = details && details.keepOriginalCaseOnKeys
        ? attributes[key]
        : camelizeKeys(attributes[key]);
    }
  });

  if (meta) {
    result.meta = {};
    findMeta(schema).forEach(({ key, details }) => {
      if (hasKey(meta, key)) {
        result.meta[camelize(key)] = details && details.keepOriginalCaseOnKeys
          ? meta[key]
          : camelizeKeys(meta[key]);
      }
    });
  }

  if (relationships) {
    relationshipsMeta.forEach(({ relationship, collection, types }) => {
      if (relationships[relationship]) {
        const relData = relationships[relationship].data;

        let value;

        if (types.length > 1) {
          value = relData;
        } else if (!relData) {
          value = null;
        } else if (collection) {
          value = relData.map(x => x.id);
        } else {
          value = relData.id;
        }

        result[camelize(relationship)] = value;
      }
    });
  }

  return result;
}

export default function deserializeJsonApi(type, link, json) {
  if (!json) {
    return json;
  }

  const relationshipsMeta = jsonSchemaRelationships(link.targetSchema);

  const { data } = json;

  if (Array.isArray(data)) {
    return data.map(item => deserialize(type, relationshipsMeta, link.targetSchema, item));
  }

  return deserialize(type, relationshipsMeta, link.targetSchema, data);
}
