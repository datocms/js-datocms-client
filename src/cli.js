import 'dotenv/config';
import { docopt } from 'docopt';
import pkg from '../package.json';
import dump from './dump/command';
import check from './check/command';
import wpImport from './wpImport/command';
import contentfulImport from './contentfulImport/command';
import toggleMaintenanceMode from './toggleMaintenanceMode/command';
import createMigrationScript from './createMigrationScript/command';
import runPendingMigrations from './runPendingMigrations/command';
import getPrimaryEnvironment from './environment/getPrimary/command';
import promoteEnvironment from './environment/promote/command';
import destroyEnvironment from './environment/destroy/command';

const doc = `
DatoCMS CLI tool

Usage:
  dato dump [--watch] [--verbose] [--preview] [--token=<apiToken>] [--environment=<environment>] [--config=<file>] [--cmaBaseUrl=<url>]
  dato new migration <name> [--migrationsDir=<directory>] [--migrationTemplate=<migrationTemplateFile>]
  dato migrate [--source=<environment>] [--destination=<environment>] [--inPlace] [--migrationModel=<apiKey>] [--migrationsDir=<directory>] [--token=<apiToken>] [--cmaBaseUrl=<url>]
  dato environment get-primary [--token=<apiToken>] [--cmaBaseUrl=<url>]
  dato environment promote <environmentId> [--token=<apiToken>] [--cmaBaseUrl=<url>]
  dato environment destroy <environmentId> [--token=<apiToken>] [--cmaBaseUrl=<url>]
  dato maintenance (on|off) [--force] [--token=<apiToken>] [--cmaBaseUrl=<url>]
  dato wp-import --token=<datoApiToken> [--environment=<datoEnvironment>] --wpUrl=<url> --wpUser=<user> --wpPassword=<password> [--datoCmaBaseUrl=<url>]
  dato contentful-import --datoCmsToken=<apiToken> --contentfulToken=<apiToken> --contentfulSpaceId=<spaceId> [--contentfulEnvironment=<contentfulEnvironment>] [--datoCmsEnvironment=<datoEnvironment>] [--skipContent] [--datoCmaBaseUrl=<url>] [(--includeOnly <contentType>...)]
  dato check
  dato -h | --help
  dato --version

Options:
  --migrationsDir=<directory>   Directory containing the migration scripts [default: ./migrations]
  --migrationModel=<apiKey>     API key of the migration model [default: schema_migration]
  --cmaBaseUrl=<url>           DatoCMS CMA base URL [default: https://site-api.datocms.com/]
`;

module.exports = argv => {
  const options = docopt(doc, { argv, version: pkg.version });

  if (options.dump) {
    return dump(options);
  }

  if (options.check) {
    return check(options);
  }

  if (options.maintenance) {
    const {
      on,
      '--token': token,
      '--force': force,
      '--cmaBaseUrl': cmaBaseUrl,
    } = options;
    return toggleMaintenanceMode({ activate: on, token, force, cmaBaseUrl });
  }

  if (options.new && options.migration) {
    const {
      '<name>': name,
      '--migrationsDir': relativeMigrationsDir,
      '--migrationTemplate': relativeMigrationTemplatePath = null,
    } = options;

    return createMigrationScript({
      name,
      relativeMigrationsDir,
      relativeMigrationTemplatePath,
    });
  }

  if (options.migrate) {
    const {
      '--source': sourceEnvId,
      '--destination': destinationEnvId,
      '--migrationModel': migrationModelApiKey,
      '--migrationsDir': relativeMigrationsDir,
      '--inPlace': inPlace,
      '--token': token,
      '--cmaBaseUrl': cmaBaseUrl,
    } = options;

    return runPendingMigrations({
      sourceEnvId,
      destinationEnvId,
      inPlace,
      migrationModelApiKey,
      relativeMigrationsDir,
      token,
      cmaBaseUrl,
    });
  }

  if (options.environment) {
    if (options['get-primary']) {
      const { '--token': token, '--cmaBaseUrl': cmaBaseUrl } = options;
      return getPrimaryEnvironment({ token, cmaBaseUrl });
    }

    if (options.promote) {
      const {
        '<environmentId>': environmentId,
        '--token': token,
        '--cmaBaseUrl': cmaBaseUrl,
      } = options;
      return promoteEnvironment({ environmentId, token, cmaBaseUrl });
    }

    if (options.destroy) {
      const {
        '<environmentId>': environmentId,
        '--token': token,
        '--cmaBaseUrl': cmaBaseUrl,
      } = options;
      return destroyEnvironment({ environmentId, token, cmaBaseUrl });
    }
  }

  if (options['wp-import']) {
    const {
      '--token': token,
      '--environment': environment,
      '--wpUrl': wpUrl,
      '--wpUser': wpUser,
      '--wpPassword': wpPassword,
      '--datoCmaBaseUrl': cmaBaseUrl,
    } = options;

    return wpImport(token, environment, wpUrl, wpUser, wpPassword, cmaBaseUrl);
  }

  if (options['contentful-import']) {
    const {
      '--contentfulToken': contentfulToken,
      '--contentfulSpaceId': contentfulSpaceId,
      '--contentfulEnvironment': contentfulEnvironment,
      '--datoCmsToken': datoCmsToken,
      '--datoCmsEnvironment': datoCmsEnvironment,
      '--skipContent': skipContent,
      '--includeOnly': includeOnly,
      '--datoCmaBaseUrl': datoCmsCmaBaseUrl,
      '<contentType>': contentType,
    } = options;

    return contentfulImport({
      contentfulToken,
      contentfulSpaceId,
      contentfulEnvironment,
      datoCmsCmaBaseUrl,
      datoCmsToken,
      datoCmsEnvironment,
      skipContent,
      contentType: includeOnly ? contentType : false,
    });
  }

  return false;
};
