import findInfoForProperty from './findInfoForProperty';

export default function jsonSchemaType(schema) {
  const typeProperty = findInfoForProperty('type', schema);

  if (!typeProperty) {
    return null;
  }

  return typeProperty.pattern.replace(
    new RegExp(/(^\^|\$$)/, 'g'),
    '',
  );
}
