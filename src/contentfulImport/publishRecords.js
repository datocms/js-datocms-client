import ora from 'ora';
import Progress from './progress';

export default async ({
  recordIds, datoClient,
}) => {
  const spinner = ora('').start();
  const progress = new Progress(recordIds.length, 'Publishing records');

  spinner.text = progress.tick();
  for (const recordId of recordIds) {
    try {
      await datoClient.items.publish(recordId);
      spinner.text = progress.tick();
    } catch (e) {
      spinner.fail(e);
      process.exit();
    }
  }

  spinner.succeed();
};
