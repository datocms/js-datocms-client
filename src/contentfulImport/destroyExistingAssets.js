import ora from 'ora';
import Progress from './progress';

export default async ({ datoClient }) => {
  let spinner = ora('Fetching assets not in use').start();

  try {
    const uploads = await datoClient.uploads.all(
      { 'filter[fields][in_use][eq]': 'not_used' },
      { allPages: true },
    );

    spinner.succeed();

    if (uploads.length > 0) {
      const progress = new Progress(
        uploads.length,
        'Destroying assets not in use',
      );
      spinner = ora('').start();
      spinner.text = progress.tick();

      for (const upload of uploads) {
        await datoClient.uploads.destroy(upload.id);
        spinner.text = progress.tick();
      }

      spinner.succeed();
    }
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
