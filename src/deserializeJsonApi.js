function deserialize({ id, attributes, relationships }) {
  const result = Object.assign({ id }, attributes);

  if (relationships) {
    const relationshipKeys = Object.keys(relationships);
    relationshipKeys.forEach(key => {
      const relationshipData = relationships[key].data;

      if (Array.isArray(relationshipData)) {
        const relationshipBody = relationshipData.map(obj => obj.id);
        result[key] = relationshipBody;
        return;
      }
      if (relationshipData != null) {
        result[key] = relationshipData.id;
        return;
      }
    });
  }
  return result;
}

export default function deserializeJsonApi(json) {
  const data = json.data;

  if (Array.isArray(data)) {
    return data.map(item => deserialize(item));
  }

  return deserialize(data);
}
