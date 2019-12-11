import createStringField from './fields/string';
import createTextField from './fields/text';

export default async function category(dato) {
  const itemType = await dato.itemTypes.create({
    apiKey: 'category',
    name: 'Category',
    tree: true,
  });

  for (const apiKey of ['name', 'slug']) {
    await createStringField(itemType, dato, apiKey);
  }

  await createTextField(itemType, dato, 'description');

  return itemType.id;
}
