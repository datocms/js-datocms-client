import humps from 'humps';
import pluralize from 'pluralize';

export const toItemApiKey = value => {
  return pluralize.singular(humps.decamelize(value));
};

export const toFieldApiKey = value => {
  const reservedKeys = [
    'position',
    'is_valid',
    'id',
    'type',
    'updated_at',
    'created_at',
    'attributes',
    'fields',
    'item_type',
    'is_singleton',
    'seo_meta_tags',
    'parent_id',
    'parent',
    'children',
    'status',
    'meta',
    'eq',
    'neq',
    'all_in',
    'any_in',
    'exists',
  ];

  const apiKey = humps.decamelize(value);

  if (reservedKeys.indexOf(apiKey) < 0) {
    return apiKey;
  }

  return `${apiKey}_field`;
};
