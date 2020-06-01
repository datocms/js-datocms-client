import path from 'path';
import fs from 'fs';
import ora from 'ora';

import SiteClient from '../site/SiteClient';
import requireToken from '../dump/requireToken';
import upsertMigrationModel from './upsertMigrationModel';

const MIGRATION_FILE_REGEXP = /^[0-9]+.*\.js$/;

export default async function runPendingMigrations({
  sourceEnvId,
  destinationEnvId,
  migrationModelApiKey,
  relativeMigrationsDir,
  inPlace,
  token: tokenByArg,
}) {
  const token =
    tokenByArg || process.env.DATO_API_TOKEN || (await requireToken());

  const globalClient = new SiteClient(token, {});

  const primaryEnv = (await globalClient.environments.all()).find(env => env.meta.primary);

  const sourceEnv = sourceEnvId
    ? await globalClient.environments.find(sourceEnvId)
    : primaryEnv;

  const environmentId = inPlace
    ? sourceEnv.id
    : destinationEnvId || `${sourceEnv.id}-with-migrations`;

  if (inPlace) {
    if (primaryEnv.id === environmentId) {
      process.stdout.write('Running migrations on primary environment is not allowed!\n');
      process.exit(1);
    }
  } else {
    const forkSpinner = ora(
      `Creating a fork of \`${sourceEnv.id}\` called \`${environmentId}\`...`,
    ).start();

    await globalClient.environments.fork(sourceEnv.id, {
      id: environmentId,
    });

    forkSpinner.succeed();
  }

  const client = new SiteClient(token, { environment: environmentId });

  const migrationModel = await upsertMigrationModel(
    client,
    migrationModelApiKey,
  );

  const alreadyRunMigrations = (
    await client.items.all(
      { filter: { type: migrationModel.id } },
      { allPages: true },
    )
  ).map(m => m.name);

  const migrationsDir = path.resolve(relativeMigrationsDir);

  const migrationsToRun = fs
    .readdirSync(migrationsDir)
    .filter(file => file.match(MIGRATION_FILE_REGEXP))
    .filter(file => !alreadyRunMigrations.includes(file))
    .sort();

  for (const migrationFile of migrationsToRun) {
    const migrationAbsolutePath = path.join(migrationsDir, migrationFile);
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const migration = require(migrationAbsolutePath);

    const migrationSpinner = ora(`Running ${migrationFile}...`).start();

    await migration(client);

    migrationSpinner.succeed();

    await client.items.create({
      itemType: migrationModel.id,
      name: migrationFile,
    });
  }

  process.stdout.write('Done!\n');
}
