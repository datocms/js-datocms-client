import { docopt } from 'docopt';
import pkg from '../package.json';
import dump from './dump/command';
import migrateSlugs from './migrateSlugs/command';

const doc = `
DatoCMS CLI tool

Usage:
  dato dump [--token=<apiToken>] [--config=<file>]
  dato migrate-slugs [--token=<apiToken>] [--skip-id-prefix]
  dato -h | --help
  dato --version
`;

const options = docopt(doc, { version: pkg.version });

if (options.dump) {
  dump(options);
}

if (options['migrate-slugs']) {
  migrateSlugs(options);
}
