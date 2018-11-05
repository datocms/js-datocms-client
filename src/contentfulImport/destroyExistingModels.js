import ora from 'ora';
import Progress from './progress';
import { toItemApiKey } from './toApiKey';

export default async ({ datoClient, contentfulData }) => {
  let spinner = ora('Fetching existing models').start();

  const itemTypes = await datoClient.itemTypes.all();

  const importedItemTypes = itemTypes.filter((itemType) => {
    return contentfulData.contentTypes.some((contentType) => {
      return itemType.apiKey === toItemApiKey(contentType.sys.id);
    });
  });

  spinner.succeed();

  if (importedItemTypes.length > 0) {
    spinner = ora('').start();
    const progress = new Progress(
      importedItemTypes.length,
      'Destroying existing models',
    );

    spinner.text = progress.tick();

    for (const itemType of importedItemTypes) {
      try {
        spinner.text = progress.tick();
        await datoClient.itemTypes.destroy(itemType.id);
      } catch (e) {
        spinner.fail(e);
        process.exit();
      }
    }

    spinner.succeed();
  }
};
