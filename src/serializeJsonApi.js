function serializeRelationships(item, relationships) {
  const result = {};

  Object.entries(relationships).forEach(([name, type]) => {
    const idOrIds = item[name];

    let data = null;

    if (Array.isArray(idOrIds)) {
      data = idOrIds.map(id => ({ type, id }));
    } else if (idOrIds) {
      data = { type, id: idOrIds };
    }

    result[name] = { data };
  });

  return result;
}

function serialize(
  item,
  {
    type,
    attributes,
    requiredAttributes,
    relationships,
    requiredRelationships,
  }
) {
  const result = { type, attributes: {} };

  attributes.forEach((attribute) => {
    if (attribute in item) {
      result.attributes[attribute] = item[attribute];
    }
  });

  if (item.id) {
    result.id = item.id;
  }

  if (requiredAttributes) {
    requiredAttributes.forEach((requiredAttribute) => {
      if (item[requiredAttribute] === undefined) {
        throw new Error(`Required attribute: ${requiredAttribute}`);
      }
    });
  }

  if (relationships) {
    result.relationships = serializeRelationships(item, relationships);

    if (requiredRelationships) {
      requiredRelationships.forEach((requiredRelationship) => {
        if (item[requiredRelationship] === undefined) {
          throw new Error(`Required relationship: ${requiredRelationship}!`);
        }
      });
    }
  }

  return result;
}

export default function serializeJsonApi(...args) {
  if (args.length === 2) {
    const [singleOrCollection, rules] = args;
    if (Array.isArray(singleOrCollection)) {
      const data = singleOrCollection.map(obj => serialize(obj, rules));
      return { data };
    }

    return { data: serialize(singleOrCollection, rules) };
  }

  if (args.length === 3) {
    const [id, attributes, rules] = args;
    const newObject = Object.assign({}, { id: id.toString() }, attributes);
    const data = serialize(newObject, rules);
    return { data };
  }

  throw new Error('Invalid arguments');
}
