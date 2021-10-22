import ora from 'ora';
import SiteClient from '../../site/SiteClient';

export default async function command({
  environmentId,
  token: tokenByArg,
  cmaBaseUrl,
}) {
  const spinner = ora(
    `Destroying environment \`${environmentId}\`...\n`,
  ).start();
  const token = tokenByArg || process.env.DATO_MANAGEMENT_API_TOKEN;
  const client = new SiteClient(token, { baseUrl: cmaBaseUrl });

  try {
    await client.environments.destroy(environmentId);
    spinner.succeed(`Destroyed environment: \`${environmentId}\``);
  } catch (error) {
    spinner.fail();
    throw error;
  }
}
