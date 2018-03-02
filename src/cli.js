import dotenv from 'dotenv';
import { docopt } from 'docopt';
import pkg from '../package.json';
import dump from './dump/command';
import check from './check/command';

dotenv.load({ silent: true });

const doc = `
DatoCMS CLI tool

Usage:
  dato dump [--watch] [--verbose] [--token=<apiToken>] [--config=<file>]
  dato check
  dato -h | --help
  dato --version
`;

const options = docopt(doc, { version: pkg.version });

if (options.dump) {
  dump(options);
}

if (options.check) {
  check(options);
}
