/* eslint-disable no-constant-condition */
import ora from 'ora';
import Progress from './progress';
import { toFieldApiKey } from './toApiKey';

const findItemTypeId = ({ contentfulField, itemTypeMapping }) => {
  const linkValidation = contentfulField.validations.find(
    val => val.linkContentType,
  );

  if (linkValidation) {
    return linkValidation.linkContentType.map(contentType =>
      itemTypeMapping[contentType.sys.id].map(iT => iT.id),
    );
  }

  return itemTypeMapping.map(pair => Object.values(pair)).flat();
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
      fieldsMapping[contentType.sys.id] = [];

      const itemType = itemTypeMapping[contentType.sys.id];

      for (const contentfulField of contentType.fields) {
        const position = contentType.fields.indexOf(contentfulField);

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
        fieldsMapping[contentType.sys.id].push(datoField);
      }
    }

    spinner.succeed();
    return fieldsMapping;
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
