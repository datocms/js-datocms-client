import ora from 'ora';

async function allPages(apiCall) {
  const limit = 100;
  let items = [];
  let skip = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await apiCall({ skip, limit, order: 'sys.createdAt' });

    const { items: pageItems, total } = response;

    items = [].concat(items, pageItems);

    if (items.length >= total) {
      break;
    } else {
      skip += limit;
    }
  }

  return items;
}

export default async ({ client, skipContent, contentType, contentfulEnvironment }) => {
  const spinner = ora('Downloading Contentful data structure').start();
  const environments = await client.getEnvironments();
  const environment = environments.items.find(e => e.name === (contentfulEnvironment || 'master'));
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
    const rawEntries = await allPages(environment.getEntries.bind(environment));
    const rawAssets = await allPages(environment.getAssets.bind(environment));

    entries = contentType
      ? rawEntries.filter(entry =>
          includeTypes.has(entry.sys.contentType.sys.id),
        )
      : rawEntries;
    assets = rawAssets;
  }

  spinner.succeed(
    `Found ${entries.length} entries and ${assets.length} assets in Contentful project`,
  );

  return {
    defaultLocale,
    locales,
    contentTypes,
    entries,
    assets,
  };
};
