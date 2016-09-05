import path from 'path';
import fs from 'fs';
import PrettyError from 'pretty-error';
import pkg from '../../package.json';
import SiteClient from '../site/SiteClient';
import dump from './dump';
import detectSsg from './detectSsg';
import { docopt } from 'docopt';
import { Spinner } from 'cli-spinner';

const doc = `
DatoCMS CLI tool

Usage:
  dato dump [--token=<apiToken>] [--config=<file>]
  dato -h | --help
  dato --version
`;

const options = docopt(doc, { version: pkg.version });

if (options.dump) {
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

  dump(configFile, client)
    .then(() => {
      spinner.stop();
      process.stdout.write('\n\x1b[32m✓\x1b[0m Done!\n');
    })
    .catch(e => {
      spinner.stop();
      process.stdout.write(pe.render(e));
    });
}
