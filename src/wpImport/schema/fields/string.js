import { titleize } from 'inflected';

export default async function string(itemType, dato, apiKey, options = {}) {
  return dato.fields.create(itemType.id, {
    fieldType: 'string',
    apiKey,
    label: titleize(apiKey),
    ...options,
  });
}
