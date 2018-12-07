function deserialize({
  id,
  attributes,
  meta,
  relationships,
}) {
  const result = { id };

  if (meta) {
    result.meta = meta;
  }

  Object.assign(result, attributes);

  if (relationships) {
    const relationshipKeys = Object.keys(relationships);
    relationshipKeys.forEach((key) => {
      const relationshipData = relationships[key].data;

      if (Array.isArray(relationshipData)) {
        const relationshipBody = relationshipData.map(obj => obj.id);
        result[key] = relationshipBody;
        return;
      }
      result[key] = relationshipData ? relationshipData.id : null;
    });
  }

  return result;
}

export default function deserializeJsonApi(json) {
  if (!json) {
    return json;
  }

  const { data } = json;

  if (Array.isArray(data)) {
    return data.map(item => deserialize(item));
  }

  return deserialize(data);
}
