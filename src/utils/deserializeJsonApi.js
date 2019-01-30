import { camelize } from 'humps';
import jsonSchemaRelationships from './jsonSchemaRelationships';

function deserialize(
  relationshipsMeta,
  {
    id,
    attributes,
    meta,
    relationships,
  },
) {
  const result = { id };

  if (meta) {
    result.meta = meta;
  }

  Object.assign(result, attributes);

  if (relationships) {
    relationshipsMeta.forEach(({ relationship, collection, types }) => {
      if (relationships[camelize(relationship)]) {
        const relData = relationships[camelize(relationship)].data;

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

export default function deserializeJsonApi(link, json) {
  if (!json) {
    return json;
  }

  const relationshipsMeta = jsonSchemaRelationships(link.targetSchema);

  const { data } = json;

  if (Array.isArray(data)) {
    return data.map(item => deserialize(relationshipsMeta, item));
  }

  return deserialize(relationshipsMeta, data);
}
