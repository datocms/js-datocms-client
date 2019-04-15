import dotenv from 'dotenv';
import { docopt } from 'docopt';
import pkg from '../package.json';
import dump from './dump/command';
import check from './check/command';
import wpImport from './wpImport/command';
import contentfulImport from './contentfulImport/command';

dotenv.load({ silent: true });

const doc = `
DatoCMS CLI tool

Usage:
  dato dump [--watch] [--verbose] [--preview] [--token=<apiToken>] [--config=<file>]
  dato wp-import --token=<datoApiToken> --wpUrl=<url> --wpUser=<user> --wpPassword=<password>
  dato contentful-import --datoCmsToken=<apiToken> --contentfulToken=<apiToken> --contentfulSpaceId=<spaceId> [--skipContent]
  dato check
  dato -h | --help
  dato --version
`;

const options = docopt(doc, { version: pkg.version });

if (options.dump) {
  dump(options);
} else if (options.check) {
  check(options);
} else if (options['wp-import']) {
  const {
    '--token': token,
    '--wpUrl': wpUrl,
    '--wpUser': wpUser,
    '--wpPassword': wpPassword,
  } = options;

  wpImport(token, wpUrl, wpUser, wpPassword);
} else if (options['contentful-import']) {
  const {
    '--contentfulToken': contentfulToken,
    '--contentfulSpaceId': contentfulSpaceId,
    '--datoCmsToken': datoCmsToken,
    '--skipContent': skipContent,
  } = options;

  contentfulImport(contentfulToken, contentfulSpaceId, datoCmsToken, skipContent);
}
