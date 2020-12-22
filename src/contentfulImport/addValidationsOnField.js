/* eslint-disable no-constant-condition */

import ora from 'ora';
import Progress from './progress';
import datoFieldValidatorsFor from './datoFieldValidatorsFor';

export default async ({ fieldsMapping, datoClient, contentfulData }) => {
  const spinner = ora('').start();

  try {
    const { contentTypes } = contentfulData;
    const fieldsSize = contentTypes
      .map(contentType => contentType.fields.length)
      .reduce((acc, length) => acc + length, 0);

    const progress = new Progress(fieldsSize, 'Adding validations on fields');
    spinner.text = progress.tick();

    for (const contentType of contentTypes) {
      const itemTypeFields = fieldsMapping[contentType.sys.id];

      for (const field of contentType.fields) {
        const datoField = itemTypeFields.find(f => f.apiKey === field.id);
        if (!datoField) {
          break;
        }

        const validators = await datoFieldValidatorsFor({ field });

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
