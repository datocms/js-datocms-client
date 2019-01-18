/* eslint-disable no-constant-condition */

import ora from 'ora';
import Progress from './progress';
import { toItemApiKey, toFieldApiKey } from './toApiKey';
import datoFieldValidatorsFor from './datoFieldValidatorsFor';
import delay from './delay';

export default async ({
  itemTypes, fieldsMapping, datoClient, contentfulData,
}) => {
  const spinner = ora('').start();
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
      while (true) {
        const fieldApiKey = toFieldApiKey(field.id);
        const datoField = itemTypeFields.find(f => f.apiKey === fieldApiKey);
        if (!datoField) {
          break;
        }

        const validators = await datoFieldValidatorsFor({ field, itemTypes });

        try {
          await datoClient.fields.update(datoField.id, { validators });
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
  }

  spinner.succeed();
};
