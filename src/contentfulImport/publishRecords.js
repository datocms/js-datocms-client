import ora from 'ora';
import Progress from './progress';

export default async ({ recordIds, datoClient }) => {
  const spinner = ora('').start();
  const progress = new Progress(recordIds.length, 'Publishing records');

  spinner.text = progress.tick();

  for (const recordId of recordIds) {
    try {
      await datoClient.items.publish(recordId);
      spinner.text = progress.tick();
    } catch (e) {
      console.log(
        `Cannot publish record: ${recordId}.`,
        `Contentful allows for published records with draft links, DatoCMS don't.`,
        `Error: ${e}`,
      );
    }
  }

  spinner.succeed();
};
