import 'dotenv/config';
import { docopt } from 'docopt';
import pkg from '../package.json';
import dump from './dump/command';
import check from './check/command';
import wpImport from './wpImport/command';
import contentfulImport from './contentfulImport/command';

const doc = `
DatoCMS CLI tool

Usage:
  dato dump [--watch] [--verbose] [--preview] [--token=<apiToken>] [--environment=<environment>] [--config=<file>]
  dato wp-import --token=<datoApiToken> [--environment=<datoEnvironment>] --wpUrl=<url> --wpUser=<user> --wpPassword=<password>
  dato contentful-import --datoCmsToken=<apiToken> [--datoCmsEnvironment=<datoEnvironment>] --contentfulToken=<apiToken> --contentfulSpaceId=<spaceId> [--skipContent]
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
    '--environment': environment,
    '--wpUrl': wpUrl,
    '--wpUser': wpUser,
    '--wpPassword': wpPassword,
  } = options;

  wpImport(token, environment, wpUrl, wpUser, wpPassword);
} else if (options['contentful-import']) {
  const {
    '--contentfulToken': contentfulToken,
    '--contentfulSpaceId': contentfulSpaceId,
    '--datoCmsToken': datoCmsToken,
    '--datoCmsEnvironment': datoCmsEnvironment,
    '--skipContent': skipContent,
  } = options;

  contentfulImport(
    contentfulToken,
    contentfulSpaceId,
    datoCmsToken,
    datoCmsEnvironment,
    skipContent,
  );
}
