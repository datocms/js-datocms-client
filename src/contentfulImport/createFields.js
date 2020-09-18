/* eslint-disable no-constant-condition */
import ora from 'ora';
import Progress from './progress';
import { toItemApiKey, toFieldApiKey } from './toApiKey';
import datoFieldTypeFor from './datoFieldTypeFor';
import datoLinkItemTypeFor from './datoLinkItemTypeFor';

export default async ({ itemTypes, datoClient, contentfulData }) => {
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
      const contentTypeApiKey = toItemApiKey(contentType.sys.id);
      fieldsMapping[contentTypeApiKey] = [];

      const itemType = itemTypes.find(iT => {
        return iT.apiKey === contentTypeApiKey;
      });

      for (const contentfulField of contentType.fields) {
        const position = contentType.fields.indexOf(contentfulField);
        let validators = {};

        if (
          contentfulField.type === 'Link' &&
          contentfulField.linkType === 'Entry'
        ) {
          validators = {
            itemItemType: {
              itemTypes: datoLinkItemTypeFor({
                itemTypes,
                field: contentfulField,
              }),
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
              itemTypes: datoLinkItemTypeFor({
                itemTypes,
                field: contentfulField.items,
              }),
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
        fieldsMapping[contentTypeApiKey].push(datoField);
      }
    }

    spinner.succeed();
    return fieldsMapping;
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
