import ora from 'ora';
import Progress from './progress';

export default async ({
   contentfulData, contentfulRecordMap, datoClient
}) => {
    const spinner = ora('').start();
    const { entries } = contentfulData;
    const progress = new Progress(entries.length, 'Publishing records');

    spinner.text = progress.tick();
    for (const entry of entries) {
        try {
        if (entry.sys.publishedVersion) {
            await datoClient.items.publish(contentfulRecordMap[entry.sys.id]);
        }

        spinner.text = progress.tick();
        } catch (e) {
            spinner.fail(e);
            process.exit();
        }
    }

    spinner.succeed();
}