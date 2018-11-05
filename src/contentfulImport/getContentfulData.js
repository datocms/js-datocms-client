import ora from 'ora';

export default async (client) => {
  const spinner = ora('Downloading Contentful data structure').start();
  const environments = await client.getEnvironments();
  const environment = environments.items.find(e => e.name === 'master');
  const rawLocales = await environment.getLocales();
  const defaultLocale = rawLocales.items.find(locale => locale.default).code;
  const locales = rawLocales.items.map(locale => locale.code);
  const rawContentTypes = await environment.getContentTypes();
  const contentTypes = rawContentTypes.items;
  const rawEntries = await environment.getEntries();
  const entries = rawEntries.items;
  const rawAssets = await environment.getAssets();
  const assets = rawAssets.items;
  spinner.succeed();

  return {
    defaultLocale,
    locales,
    contentTypes,
    entries,
    assets,
  };
};
