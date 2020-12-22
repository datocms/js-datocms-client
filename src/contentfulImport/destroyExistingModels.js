import ora from 'ora';
import { singularize } from 'inflection';
import Progress from './progress';

export default async ({ datoClient, contentfulData }) => {
  let spinner = ora('Fetching existing models').start();

  try {
    const itemTypes = await datoClient.itemTypes.all();
    const importedItemTypes = itemTypes.filter(iT =>
      contentfulData.contentTypes
        .map(c => singularize(c.sys.id))
        .includes(iT.apiKey),
    );

    spinner.succeed();

    if (importedItemTypes.length > 0) {
      spinner = ora('').start();
      const progress = new Progress(
        importedItemTypes.length,
        'Destroying existing models',
      );

      spinner.text = progress.tick();

      for (const itemType of importedItemTypes) {
        spinner.text = progress.tick();
        await datoClient.itemTypes.destroy(itemType.id);
      }

      spinner.succeed();
    }
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
