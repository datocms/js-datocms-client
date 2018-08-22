import createTitleSlugField from './fields/slug';
import createTextField from './fields/text';
import createStringField from './fields/string';

export default async function author(dato) {
  const itemType = await dato.itemTypes.create({
    apiKey: 'author',
    name: 'Author',
  });

  await createTitleSlugField(itemType, dato, 'name');

  const authorsFields = [
    'username', 'first_name', 'last_name', 'email', 'url', 'nickname',
  ];

  for (const apiKey of authorsFields) {
    await createStringField(itemType, dato, apiKey);
  }

  await createTextField(itemType, dato, 'description');

  return itemType.id;
}
