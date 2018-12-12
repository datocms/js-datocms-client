export default function findInfoForProperty(propertyName, schema) {
  if (!schema || !schema.properties.data) {
    return null;
  }

  let property;

  if (schema.properties.data.type === 'array') {
    property = schema.properties.data.items.properties[propertyName];
  } else {
    property = schema.properties.data.properties[propertyName];
  }

  return property;
}
