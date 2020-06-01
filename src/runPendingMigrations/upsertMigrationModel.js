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
    const migrationItemType = await client.itemTypes.find(migrationModelApiKey);
    console.log(`Found migration model!`);

    return migrationItemType;
  } catch (e) {
    if (e instanceof ApiException && e.statusCode === 404) {
      console.log(`Migration model doesn't exists, creating it!`);
      const migrationItemType = await createMigrationModel(
        client,
        migrationModelApiKey,
      );
      return migrationItemType;
    }

    throw e;
  }
}
