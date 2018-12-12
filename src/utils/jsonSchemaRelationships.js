import findInfoForProperty from './findInfoForProperty';

const type = (definition) => {
  if (definition.properties && definition.properties.type) {
    return definition.properties.type.pattern
      .replace(new RegExp(/(^\^|\$$)/, 'g'), '');
  }

  return null;
};

export default function jsonSchemaRelationships(schema) {
  const infoForProperty = findInfoForProperty('relationships', schema);

  if (!infoForProperty) {
    return [];
  }

  return Object.entries(infoForProperty.properties).map(([relationship, relAttributes]) => {
    const isCollection = relAttributes.properties.data.type === 'array';
    const isObject = relAttributes.properties.data.type === 'object';

    let types;

    if (isCollection) {
      types = [type(relAttributes.properties.data.items)];
    } else if (isObject) {
      types = [type(relAttributes.properties.data)];
    } else {
      types = relAttributes.properties.data.anyOf.map(x => type(x)).filter(x => !!x);
    }

    return { relationship, collection: isCollection, types };
  });
}
