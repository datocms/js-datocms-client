export function findEntityInData(schema) {
  if (!schema || !schema.properties.data) {
    return null;
  }

  if (schema.properties.data.type === 'array') {
    if (schema.properties.data.items) {
      return schema.properties.data.items;
    }

    return null;
  }

  if (schema.properties.data.type === 'object') {
    return schema.properties.data;
  }

  if (schema.properties.data.anyOf) {
    return schema.properties.data.anyOf.find(
      x => x.definitions.type.example !== 'job',
    );
  }

  return null;
}

export default function findInfoForProperty(propertyName, schema) {
  const entity = findEntityInData(schema);

  if (!entity) {
    return null;
  }

  return entity.properties[propertyName];
}
