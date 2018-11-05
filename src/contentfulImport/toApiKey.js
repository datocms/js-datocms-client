import humps from 'humps';
import pluralize from 'pluralize';

export const toItemApiKey = (value) => {
  return pluralize.singular(
    humps.decamelize(value),
  );
};

export const toFieldApiKey = (value) => {
  const revervedKeys = [
    'position', 'is_valid', 'id', 'type', 'updated_at', 'attributes', 'fields',
    'item_type', 'is_singleton', 'seo_meta_tags', 'parent_id', 'parent',
    'children', 'status',
  ];

  const apiKey = humps.decamelize(value);

  if (revervedKeys.indexOf(apiKey) < 0) {
    return apiKey;
  }
  return `_${apiKey}`;
};
