/* eslint-disable no-constant-condition */

import ora from 'ora';
import { singular } from 'pluralize';
import Progress from './progress';

export default async ({ datoClient, contentfulData }) => {
  let spinner = ora('Fetching existing fields').start();

  try {
    const itemTypes = await datoClient.itemTypes.all();
    const importedItemTypes = itemTypes.filter(iT =>
      contentfulData.contentTypes
        .map(c => singular(c.sys.id))
        .includes(iT.apiKey),
    );

    const importedFieldIds = importedItemTypes
      .map(itemType => itemType.fields)
      .flat();

    spinner.succeed();

    spinner = ora('').start();
    const progress = new Progress(
      importedFieldIds.length,
      'Removing validations from fields',
    );
    spinner.text = progress.tick();

    for (const fieldId of importedFieldIds) {
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
    }

    spinner.succeed();
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
