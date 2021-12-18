import ora from 'ora';
import ApiException from '../ApiException';

async function createMigrationModel(
  client,
  migrationModelApiKey,
  catchPermissionErrors,
) {
  const model = await catchPermissionErrors(
    `create model ${migrationModelApiKey}`,
    client.itemTypes.create({
      name: 'Schema migration',
      apiKey: migrationModelApiKey,
    }),
  );

  await catchPermissionErrors(
    `create field for model ${migrationModelApiKey}`,
    client.fields.create(model.id, {
      label: 'Migration file name',
      apiKey: 'name',
      fieldType: 'string',
      validators: {
        required: {},
      },
    }),
  );

  return model;
}

export default async function upsertMigrationModel(
  client,
  migrationModelApiKey,
  catchPermissionErrors,
  dryRun,
) {
  try {
    return await catchPermissionErrors(
      `fetch model ${migrationModelApiKey}`,
      client.itemTypes.find(migrationModelApiKey),
    );
  } catch (e) {
    if (e instanceof ApiException && e.statusCode === 404) {
      const creationSpinner = ora(
        `Creating \`${migrationModelApiKey}\` model...`,
      ).start();

      let migrationItemType = null;

      if (!dryRun) {
        migrationItemType = await createMigrationModel(
          client,
          migrationModelApiKey,
          catchPermissionErrors,
        );
      }

      creationSpinner.succeed();

      return migrationItemType;
    }

    throw e;
  }
}
