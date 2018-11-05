import ora from 'ora';
import Progress from './progress';

export default async ({ datoClient }) => {
  let spinner = ora('Fetching assets not in use').start();

  const uploads = await datoClient.uploads.all({ 'filter[type]': 'not_used' }, { allPages: true });

  spinner.succeed();

  if (uploads.length > 0) {
    const progress = new Progress(uploads.length, 'Destroying assets not in use');
    spinner = ora('').start();
    spinner.text = progress.tick();

    for (const upload of uploads) {
      try {
        await datoClient.uploads.destroy(upload.id);
        spinner.text = progress.tick();
      } catch (e) {
        spinner.fail(e);
        process.exit();
      }
    }

    spinner.succeed();
  }
};
