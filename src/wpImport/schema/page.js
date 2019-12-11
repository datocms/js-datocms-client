import createStringField from './fields/string';
import createTextField from './fields/text';

export default async function page(dato, authorId) {
  const itemType = await dato.itemTypes.create({
    apiKey: 'page',
    draftModeActive: true,
    name: 'Page',
  });

  for (const apiKey of ['title', 'slug']) {
    await createStringField(itemType, dato, apiKey);
  }

  for (const apiKey of ['excerpt', 'content']) {
    await createTextField(itemType, dato, apiKey);
  }

  await dato.fields.create(itemType.id, {
    apiKey: 'featured_media',
    fieldType: 'file',
    label: 'Main image',
    validators: {},
  });

  await dato.fields.create(itemType.id, {
    apiKey: 'author',
    fieldType: 'link',
    label: 'Author',
    validators: { itemItemType: { itemTypes: [authorId] } },
  });

  await dato.fields.create(itemType.id, {
    apiKey: 'date',
    fieldType: 'date',
    label: 'Date',
    validators: { required: {} },
  });

  return itemType.id;
}
