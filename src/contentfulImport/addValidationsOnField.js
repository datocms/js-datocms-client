/* eslint-disable no-constant-condition */

import ora from 'ora';
import Progress from './progress';
import { toItemApiKey, toFieldApiKey } from './toApiKey';
import datoFieldValidatorsFor from './datoFieldValidatorsFor';

export default async ({
  itemTypes,
  fieldsMapping,
  datoClient,
  contentfulData,
}) => {
  const spinner = ora('').start();

  try {
    const { contentTypes } = contentfulData;
    const fieldsSize = contentTypes
      .map(contentType => contentType.fields.length)
      .reduce((acc, length) => acc + length, 0);

    const progress = new Progress(fieldsSize, 'Adding validations on fields');
    spinner.text = progress.tick();

    for (const contentType of contentTypes) {
      const contentTypeApiKey = toItemApiKey(contentType.sys.id);

      const itemTypeFields = fieldsMapping[contentTypeApiKey];

      for (const field of contentType.fields) {
        const fieldApiKey = toFieldApiKey(field.id);
        const datoField = itemTypeFields.find(f => f.apiKey === fieldApiKey);
        if (!datoField) {
          break;
        }

        const validators = await datoFieldValidatorsFor({ field, itemTypes });
        await datoClient.fields.update(datoField.id, { validators });
        spinner.text = progress.tick();
      }
    }

    spinner.succeed();
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
