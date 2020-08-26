import SiteClient from '../site/SiteClient';

export default async function destroyEnvironment({
  environmentId,
  token: tokenByArg,
}) {
  const token = tokenByArg || process.env.DATO_MANAGEMENT_API_TOKEN;
  const client = new SiteClient(token, {});

  await client.environments.destroy(environmentId);

  process.stdout.write(`Destroyed environment: ${environmentId}\n`);
}
