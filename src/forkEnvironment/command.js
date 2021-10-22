import ora from 'ora';
import SiteClient from '../site/SiteClient';

export default async function runPendingMigrations({
  sourceEnvId,
  destinationEnvId,
  cmaBaseUrl,
  token: tokenByArg,
}) {
  const token = tokenByArg || process.env.DATO_MANAGEMENT_API_TOKEN;

  const client = new SiteClient(token, { baseUrl: cmaBaseUrl });
  const allEnvironments = await client.environments.all();
  const sourceEnv = await client.environments.find(sourceEnvId);

  const forkSpinner = ora(
    `Creating a fork of \`${sourceEnv.id}\` called \`${destinationEnvId}\`...`,
  ).start();

  const existingEnvironment = allEnvironments.find(
    env => env.id === destinationEnvId,
  );

  if (existingEnvironment) {
    forkSpinner.fail();
    throw new Error(`Environment ${destinationEnvId} already exists!`);
  }

  await client.environments.fork(sourceEnv.id, {
    id: destinationEnvId,
  });

  forkSpinner.succeed();
  process.stdout.write('Done!\n');
}
