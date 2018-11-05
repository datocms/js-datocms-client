/* eslint-disable no-constant-condition */

import ora from 'ora';
import { toItemApiKey } from './toApiKey';
import Progress from './progress';
import delay from './delay';

export default async ({ datoClient, contentfulData }) => {
  let spinner = ora('Fetching existing fields').start();
  const itemTypes = await datoClient.itemTypes.all();
  const importedItemTypes = itemTypes.filter((itemType) => {
    return contentfulData.contentTypes.some((contentType) => {
      return itemType.apiKey === toItemApiKey(contentType.sys.id);
    });
  });

  const importedFieldIds = importedItemTypes.map(itemType => itemType.fields).flatten();

  spinner.succeed();

  spinner = ora('').start();
  const progress = new Progress(importedFieldIds.length, 'Removing validations from fields');
  spinner.text = progress.tick();

  for (const fieldId of importedFieldIds) {
    while (true) {
      try {
        const field = await datoClient.fields.find(fieldId);
        let validators = {};
        if (field.validators.itemItemType) {
          validators = { itemItemType: field.validators.itemItemType };
        }
        if (field.validators.itemsItemType) {
          validators = { itemsItemType: field.validators.itemsItemType };
        }
        await datoClient.fields.update(fieldId, { validators });
        spinner.text = progress.tick();
        break;
      } catch (e) {
        if (
          !e.body
            || !e.body.data
            || !e.body.data.some(d => d.id === 'BATCH_DATA_VALIDATION_IN_PROGRESS')
        ) {
          spinner.fail(e);
          process.exit();
        } else {
          await delay(1000);
        }
      }
    }
  }
  spinner.succeed();
};
