/* eslint-disable no-constant-condition */
import ora from 'ora';
import humps from 'humps';
import Progress from './progress';
import datoFieldTypeFor from './datoFieldTypeFor';
import { createStructuredTextAssetBlock } from './richTextToStructuredText';

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

const toFieldApiKey = value => {
  const apiKey = humps.decamelize(value);

  if (reservedKeys.includes(apiKey)) {
    return `${apiKey}_field`;
  }

  return apiKey;
};

const findItemTypeId = ({ contentfulField, itemTypeMapping }) => {
  const linkValidation = contentfulField.validations.find(
    val => val.linkContentType,
  );

  if (linkValidation) {
    return linkValidation.linkContentType
      .map(contentTypeId =>
        itemTypeMapping[contentTypeId]
          ? itemTypeMapping[contentTypeId].id
          : null,
      )
      .filter(Boolean);
  }

  return Object.values(itemTypeMapping).map(iT => iT.id);
};

export default async ({ itemTypeMapping, datoClient, contentfulData }) => {
  const spinner = ora('').start();

  try {
    const { contentTypes } = contentfulData;

    const fieldSize = contentTypes
      .map(contentType => contentType.fields.length)
      .reduce((acc, length) => acc + length, 0);

    const progress = new Progress(fieldSize, 'Creating fields');
    spinner.text = progress.tick();

    const fieldsMapping = {};

    for (const contentType of contentTypes) {
      const contentTypeId = contentType.sys.id;

      fieldsMapping[contentTypeId] = [];

      const itemType = itemTypeMapping[contentTypeId];

      for (const contentfulField of contentType.fields) {
        const position = contentType.fields.indexOf(contentfulField);
        let validators = {};

        if (
          contentfulField.type === 'Link' &&
          contentfulField.linkType === 'Entry'
        ) {
          validators = {
            itemItemType: {
              itemTypes: findItemTypeId({ itemTypeMapping, contentfulField }),
            },
          };
        }

        if (
          contentfulField.type === 'Array' &&
          contentfulField.items.type === 'Link' &&
          contentfulField.items.linkType === 'Entry'
        ) {
          validators = {
            itemsItemType: {
              itemTypes: findItemTypeId({ itemTypeMapping, contentfulField }),
            },
          };
        }

        if (contentfulField.type === 'RichText') {
          const assetBlockId = await createStructuredTextAssetBlock(datoClient);

          validators = {
            structuredTextBlocks: {
              itemTypes: [assetBlockId],
            },
            structuredTextLinks: {
              itemTypes: findItemTypeId({ itemTypeMapping, contentfulField }),
            },
          };
        }

        const fieldAttributes = {
          label: contentfulField.name,
          fieldType: datoFieldTypeFor(contentfulField),
          localized: contentfulField.localized,
          apiKey: toFieldApiKey(contentfulField.id),
          position,
          validators,
        };

        if (
          contentfulField.id === contentType.displayField &&
          contentfulField.type === 'Symbol'
        ) {
          fieldAttributes.appearance = {
            editor: 'single_line',
            parameters: { heading: true },
            addons: [],
          };
        }

        const datoField = await datoClient.fields.create(
          itemType.id,
          fieldAttributes,
        );

        spinner.text = progress.tick();
        fieldsMapping[contentTypeId].push({
          datoField,
          contentfulFieldId: contentfulField.id,
        });
      }
    }

    spinner.succeed();
    return fieldsMapping;
  } catch (e) {
    spinner.fail();

    throw e;
  }
};
