import ora from 'ora';
import Progress from './progress';

export default async ({ recordIds, datoClient }) => {
  const spinner = ora('').start();
  try {
    const progress = new Progress(recordIds.length, 'Publishing records');

    spinner.text = progress.tick();
    for (const recordId of recordIds) {
      await datoClient.items.publish(recordId);
      spinner.text = progress.tick();
    }

    spinner.succeed();
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
