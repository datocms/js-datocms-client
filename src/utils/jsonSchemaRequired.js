import findInfoForProperty from './findInfoForProperty';

const toArray = obj => (Array.isArray(obj) ? obj : [obj]);

export default function jsonSchemaRequired(propertyName, schema) {
  const info = findInfoForProperty(propertyName, schema);
  const maybeRequired = (info && info.required) || [];

  return maybeRequired.filter((property) => {
    const propertySchema = propertyName === 'relationships'
      ? info.properties[property].properties.data
      : info.properties[property];

    if (propertySchema.anyOf) {
      const isNullAllowed = propertySchema.anyOf
        .some(def => toArray(def.type).includes('null'));
      return !isNullAllowed;
    }
    return !toArray(propertySchema.type).includes('null');
  });
}
