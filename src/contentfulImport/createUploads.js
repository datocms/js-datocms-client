import ora from 'ora';
import Progress from './progress';

export default async ({ datoClient, contentfulData }) => {
  const spinner = ora('').start();

  try {
    const { assets } = contentfulData;

    const progress = new Progress(assets.length, 'Uploading assets');
    spinner.text = progress.tick();

    const contentfulAssetsMap = {};

    for (const asset of assets) {
      if (asset.fields && asset.fields.file) {
        const fileAttributes = asset.fields.file[contentfulData.defaultLocale];

        const fileUrl = `https:${fileAttributes.url}`;

        const path = await datoClient.createUploadPath(fileUrl);

        const defaultFieldMetadata = contentfulData.locales.reduce(
          (acc, locale) => {
            return Object.assign(acc, {
              [locale]: {
                title: asset.fields.title[locale],
                alt: asset.fields.description
                  ? asset.fields.description[locale]
                  : asset.fields.title[locale],
                customData: {},
              },
            });
          },
          {},
        );

        const upload = await datoClient.uploads.create({
          path,
          author: null,
          copyright: null,
          defaultFieldMetadata,
        });

        contentfulAssetsMap[asset.sys.id.toString()] = upload.id;
      }

      spinner.text = progress.tick();
    }

    spinner.succeed();
    return contentfulAssetsMap;
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
