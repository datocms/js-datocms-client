import createStringField from './fields/string';

export default async function tag(dato) {
  const itemType = await dato.itemTypes.create({
    apiKey: 'tag',
    name: 'Tag',
  });

  for (const apiKey of ['name', 'slug']) {
    await createStringField(itemType, dato, apiKey);
  }

  return itemType.id;
}
