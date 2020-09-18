import ora from 'ora';
import SiteClient from '../../site/SiteClient';

export default async function command({
  environmentId,
  token: tokenByArg,
  cmaBaseUrl,
}) {
  const spinner = ora(
    `Promoting environment \`${environmentId}\` to primary environment\n`,
  ).start();

  const token = tokenByArg || process.env.DATO_MANAGEMENT_API_TOKEN;
  const client = new SiteClient(token, {}, cmaBaseUrl);

  try {
    await client.environments.promote(environmentId);
    spinner.succeed(`\`${environmentId}\` is now the primary environment`);
  } catch (error) {
    spinner.fail();
    throw error;
  }
}
