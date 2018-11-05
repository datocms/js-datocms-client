import ora from 'ora';

export default async ({ datoClient, contentfulData }) => {
  const spinner = ora('Setting locales');
  const site = await datoClient.site.find();
  const locales = contentfulData.locales.map(locale => locale.slice(0, 2));
  await datoClient.site.update({
    id: site.id,
    locales,
  });
  spinner.succeed();
};
