import createTitleSlugField from './fields/slug';

export default async function tag(dato) {
  const itemType = await dato.itemTypes.create({
    apiKey: 'tag',
    name: 'Tag',
  });

  await createTitleSlugField(itemType, dato, 'name');

  return itemType.id;
}
