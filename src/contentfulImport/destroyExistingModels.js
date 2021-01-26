import ora from 'ora';
import Progress from './progress';
import { toItemTypeApiKey } from './createModels';

export default async ({ datoClient, contentfulData: { contentTypes } }) => {
  let spinner = ora('Fetching existing models').start();

  try {
    const itemTypes = await datoClient.itemTypes.all();
    const contKeys = contentTypes.map(c => toItemTypeApiKey(c.sys.id));
    const imported = itemTypes.filter(iT => contKeys.includes(iT.apiKey));

    spinner.succeed();

    if (imported.length === 0) {
      return;
    }

    spinner = ora('').start();
    const progress = new Progress(
      imported.length,
      'Destroying existing models',
    );

    spinner.text = progress.tick();

    for (const itemType of imported) {
      spinner.text = progress.tick();
      await datoClient.itemTypes.destroy(itemType.id);
    }

    spinner.succeed();
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
