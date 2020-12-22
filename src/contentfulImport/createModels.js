import ora from 'ora';
import humps from 'humps';
import { singularize } from 'inflection';
import Progress from './progress';

export default async ({ datoClient, contentfulData }) => {
  const spinner = ora().start();
  try {
    const { contentTypes } = contentfulData;

    const progress = new Progress(contentTypes.length, 'Creating models');
    spinner.text = progress.tick();

    let mapping = {};

    for (const contentType of contentTypes) {
      const contKey = contentType.sys.id;
      let itemTypeApiKey = singularize(humps.decamelize(contKey));

      const itemAttributes = {
        apiKey: itemTypeApiKey,
        name: contentType.name,
        modularBlock: false,
        orderingDirection: null,
        singleton: false,
        sortable: false,
        tree: false,
        orderingField: null,
        draftModeActive: true,
      };

      const itemType = await datoClient.itemTypes
        .create(itemAttributes)
        .catch(e => {
          if (
            e.body &&
            e.body.data &&
            e.body.data[0].attributes.details.code === 'VALIDATION_PLURAL'
          ) {
            console.error(
              `Error: ${contKey} is not a valid DatoCMS model name. A ${contKey}_page will be created instead`,
            );

            itemTypeApiKey = `${contKey}_block`;

            const newAttr = {
              ...itemAttributes,
              apiKey: itemTypeApiKey,
            };

            return datoClient.itemTypes.create(newAttr);
          }
          if (
            e.body &&
            e.body.data &&
            e.body.data[0].attributes.details.code === 'VALIDATION_UNIQUENESS'
          ) {
            console.error(`Error: This model already exists`);
          } else {
            throw e;
          }
        });

      spinner.text = progress.tick();

      mapping = { ...mapping, [contentType.sys.id]: itemType };
    }

    spinner.succeed();

    return mapping;
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
