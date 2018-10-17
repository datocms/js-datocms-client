import createStringField from './string';

export default async function slug(itemType, dato, apiKey) {
  const title = await createStringField(
    itemType, dato, apiKey,
    {
      appeareance: {
        editor: 'single_line',
        parameters: { heading: true },
        addons: [],
      },
      validators: { required: {} },
    },
  );

  return dato.fields.create(itemType.id, {
    apiKey: 'slug',
    fieldType: 'slug',
    label: 'Slug',
    validators: {
      slug_title_field: { titleFieldId: title.id },
    },
  });
}
