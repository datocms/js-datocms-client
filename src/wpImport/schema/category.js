import createTitleSlugField from './fields/slug';
import createTextField from './fields/text';

export default async function category(dato) {
  const itemType = await dato.itemTypes.create({
    apiKey: 'category',
    name: 'Category',
    tree: true,
  });

  await createTitleSlugField(itemType, dato, 'name');
  await createTextField(itemType, dato, 'description');

  return itemType.id;
}
