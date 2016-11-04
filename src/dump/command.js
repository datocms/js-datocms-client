import path from 'path';
import fs from 'fs';
import PrettyError from 'pretty-error';
import { Spinner } from 'cli-spinner';
import SiteClient from '../site/SiteClient';
import detectSsg from './detectSsg';
import dump from './dump';

export default function (options) {
  const configFile = path.resolve(options['--config'] || 'dato.config.js');
  const token = options['--token'] || process.env.DATO_API_TOKEN;

  if (!token) {
    process.stdout.write(
      'Missing API token: use the --token option or set an DATO_API_TOKEN environment variable!\n'
    );
    process.exit(1);
  }

  try {
    fs.accessSync(configFile);
  } catch (e) {
    process.stdout.write(`Missing config file ${configFile}\n`);
    process.exit(1);
  }

  const client = new SiteClient(
    token,
    {
      'X-Reason': 'dump',
      'X-SSG': detectSsg(process.cwd()),
    }
  );

  const pe = new PrettyError();
  const spinner = new Spinner('%s Fetching content from DatoCMS...');
  spinner.setSpinnerString(18);
  spinner.start();

  return dump(configFile, client)
    .then(() => {
      spinner.stop();
      process.stdout.write('\n\x1b[32m✓\x1b[0m Done!\n');
    })
    .catch((e) => {
      spinner.stop();
      process.stdout.write(pe.render(e));
    });
}
