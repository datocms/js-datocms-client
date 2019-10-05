export default function findInfoForProperty(propertyName, schema) {
  if (!schema || !schema.properties.data) {
    return null;
  }

  if (schema.properties.data.type === 'array') {
    if (schema.properties.data.items) {
      return schema.properties.data.items.properties[propertyName];
    }

    return null;
  }

  if (schema.properties.data.type === 'object') {
    return schema.properties.data.properties[propertyName];
  }

  if (schema.properties.data.anyOf) {
    const subSchema = schema.properties.data.anyOf.find(x => (
      x.definitions.type.example !== 'job'
    ));

    return subSchema.properties[propertyName];
  }

  return null;
}
