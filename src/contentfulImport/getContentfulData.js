import ora from 'ora';

export default async ({ client, skipContent, contentType }) => {
  const spinner = ora('Downloading Contentful data structure').start();
  const environments = await client.getEnvironments();
  const environment = environments.items.find(e => e.name === 'master');
  const rawLocales = await environment.getLocales();
  const defaultLocale = rawLocales.items.find(locale => locale.default).code;
  const locales = rawLocales.items.map(locale => locale.code);
  const rawContentTypes = await environment.getContentTypes();
  const includeTypes = new Set(contentType || null);
  const contentTypes = contentType
    ? rawContentTypes.items.filter(type => includeTypes.has(type.sys.id))
    : rawContentTypes.items;

  let entries;
  let assets;

  if (!skipContent) {
    const rawEntries = await environment.getEntries();
    const rawAssets = await environment.getAssets();

    entries = contentType
      ? rawEntries.items.filter(entry =>
          includeTypes.has(entry.sys.contentType.sys.id),
        )
      : rawEntries.items;
    assets = rawAssets.items;
  }

  spinner.succeed();

  return {
    defaultLocale,
    locales,
    contentTypes,
    entries,
    assets,
  };
};
