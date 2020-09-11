import ora from 'ora';
import SiteClient from '../../site/SiteClient';
import ApiException from '../../ApiException';

export default async function command({
  environmentId,
  token: tokenByArg,
  cmaBaseUrl,
}) {
  const spinner = ora(
    `Destroying environment \`${environmentId}\`...\n`,
  ).start();
  const token = tokenByArg || process.env.DATO_MANAGEMENT_API_TOKEN;
  const client = new SiteClient(token, {}, cmaBaseUrl);

  try {
    await client.environments.destroy(environmentId);
    spinner.succeed(`Destroyed environment: \`${environmentId}\``);
  } catch (error) {
    spinner.fail();
    if (error instanceof ApiException) {
      process.stderr.write(
        `Unable to destroy: ${environmentId}\n${error.message}`,
      );
      process.exit(1);
    }
  }
}
