import ora from 'ora';
import ApiException from '../ApiException';

async function createMigrationModel(client, migrationModelApiKey) {
  const model = await client.itemTypes.create({
    name: 'Schema migration',
    apiKey: migrationModelApiKey,
  });

  await client.fields.create(model.id, {
    label: 'Migration file name',
    apiKey: 'name',
    fieldType: 'string',
    validators: {
      required: {},
    },
  });

  return model;
}

export default async function upsertMigrationModel(
  client,
  migrationModelApiKey,
) {
  try {
    return await client.itemTypes.find(migrationModelApiKey);
  } catch (e) {
    if (e instanceof ApiException && e.statusCode === 404) {
      const creationSpinner = ora(
        `Creating \`${migrationModelApiKey}\` model...\n`,
      ).start();

      const migrationItemType = await createMigrationModel(
        client,
        migrationModelApiKey,
      );

      creationSpinner.succeed();

      return migrationItemType;
    }

    throw e;
  }
}
