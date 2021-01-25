import ora from 'ora';
import Progress from './progress';
import toItemTypeApiKey from './toItemTypeApiKey';

export default async ({ datoClient, contentfulData }) => {
  const spinner = ora().start();

  try {
    const { contentTypes } = contentfulData;

    const progress = new Progress(contentTypes.length, 'Creating models');
    spinner.text = progress.tick();

    let mapping = {};

    for (const contentType of contentTypes) {
      const contKey = contentType.sys.id;
      const itemTypeApiKey = toItemTypeApiKey(contKey);

      const itemTypeAttributes = {
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

      const itemType = await datoClient.itemTypes.create(itemTypeAttributes);

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
