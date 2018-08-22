import createTitleSlugField from './fields/slug';
import createTextField from './fields/text';

export default async function article(dato, authorId, categoryId, tagId) {
  const itemType = await dato.itemTypes.create({
    apiKey: 'article',
    draftModeActive: true,
    name: 'Article',
  });

  await createTitleSlugField(itemType, dato, 'title');

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
    apiKey: 'categories',
    fieldType: 'links',
    label: 'Categories',
    validators: { itemsItemType: { itemTypes: [categoryId] } },
  });

  await dato.fields.create(itemType.id, {
    apiKey: 'tags',
    fieldType: 'links',
    label: 'Tags',
    validators: { itemsItemType: { itemTypes: [tagId] } },
  });

  await dato.fields.create(itemType.id, {
    apiKey: 'date',
    fieldType: 'date',
    label: 'Date',
    validators: { required: {} },
  });

  return itemType.id;
}
