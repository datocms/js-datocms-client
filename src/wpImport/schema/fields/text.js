import { titleize } from 'inflected';

export default async function text(itemType, dato, apiKey) {
  return dato.fields.create(itemType.id, {
    apiKey,
    label: titleize(apiKey),
    appearance: {
      editor: 'wysiwyg',
      parameters: {
        toolbar: [
          'format',
          'bold',
          'italic',
          'strikethrough',
          'ordered_list',
          'unordered_list',
          'quote',
          'table',
          'link',
          'image',
          'show_source',
        ],
      },
      addons: [],
    },
    fieldType: 'text',
  });
}
