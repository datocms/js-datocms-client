/* eslint-disable no-constant-condition */

import ora from 'ora';
import Progress from './progress';
import datoValidatorsFor from './datoValidatorsFor';

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
      const datoFields = fieldsMapping[contentType.sys.id];

      for (const contentfulField of contentType.fields) {
        const { datoField } = datoFields.find(
          f => f.contentfulFieldId === contentfulField.id,
        );

        if (!datoField) {
          console.log('Dato field not found');
          // eslint-disable-next-line no-continue
          continue;
        }

        const validators = datoValidatorsFor(contentfulField);

        await datoClient.fields.update(datoField.id, {
          validators: { ...datoField.validators, ...validators },
        });

        spinner.text = progress.tick();
      }
    }

    spinner.succeed();
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
