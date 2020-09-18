import path from 'path';
import fs from 'fs';
import ora from 'ora';

import SiteClient from '../site/SiteClient';
import upsertMigrationModel from './upsertMigrationModel';

const MIGRATION_FILE_REGEXP = /^[0-9]+.*\.js$/;

export default async function runPendingMigrations({
  sourceEnvId,
  destinationEnvId,
  migrationModelApiKey,
  relativeMigrationsDir,
  inPlace,
  cmaBaseUrl,
  token: tokenByArg,
}) {
  const migrationsDir = path.resolve(relativeMigrationsDir);

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Error: ${relativeMigrationsDir} is not a directory!\n`);
  }

  const allMigrations = fs
    .readdirSync(migrationsDir)
    .filter(file => file.match(MIGRATION_FILE_REGEXP));

  const token = tokenByArg || process.env.DATO_MANAGEMENT_API_TOKEN;

  const globalClient = new SiteClient(token, {}, cmaBaseUrl);

  const allEnvironments = await globalClient.environments.all();

  const primaryEnv = allEnvironments.find(env => env.meta.primary);

  const sourceEnv = sourceEnvId
    ? await globalClient.environments.find(sourceEnvId)
    : primaryEnv;

  const environmentId = inPlace
    ? sourceEnv.id
    : destinationEnvId || `${sourceEnv.id}-post-migrations`;

  if (inPlace) {
    if (primaryEnv.id === environmentId) {
      throw new Error(
        'Running migrations on primary environment is not allowed!',
      );
    }

    process.stdout.write(
      `Migrations will be run in sandbox env \`${environmentId}\`\n`,
    );
  } else {
    const forkSpinner = ora(
      `Creating a fork of \`${sourceEnv.id}\` called \`${environmentId}\`...`,
    ).start();

    const existingEnvironment = allEnvironments.find(
      env => env.id === environmentId,
    );

    if (existingEnvironment) {
      forkSpinner.fail();
      throw new Error(
        `Environment ${environmentId} already exists! If you want to run the migrations inside this existing environment you can add the --inPlace flag.`,
      );
    }

    await globalClient.environments.fork(sourceEnv.id, {
      id: environmentId,
    });

    forkSpinner.succeed();
  }

  const client = new SiteClient(
    token,
    { environment: environmentId },
    cmaBaseUrl,
  );

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

  const migrationsToRun = allMigrations
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
