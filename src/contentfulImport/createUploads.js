import ora from 'ora';
import Progress from './progress';
import { writeToFile, cached } from './cache';

export default async ({ datoClient, contentfulData }) => {
  const spinner = ora('').start();

  try {
    const { assets } = contentfulData;

    const progress = new Progress(assets.length, 'Uploading assets');
    spinner.text = progress.tick();

    const uploadsMapping = cached('uploadsMapping') || {};

    for (const asset of assets) {
      try {
        spinner.text = progress.tick();

        if (uploadsMapping[asset.sys.id.toString()]) {
          // eslint-disable-next-line no-continue
          continue;
        }

        if (!(asset.fields && asset.fields.file)) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const fileAttributes = asset.fields.file[contentfulData.defaultLocale];

        if (!fileAttributes || !fileAttributes.url) {
          // eslint-disable-next-line no-continue
          continue;
        }

        const fileUrl = `https:${fileAttributes.url}`;

        const path = await datoClient.createUploadPath(fileUrl, {
          onProgress: info => {
            let text = `Asset #${asset.sys.id.toString()} `;

            if (info.type === 'download') {
              text += `(download from CF... ${info.payload.percent}%)`;
            }
            if (info.type === 'upload') {
              text += `(upload to DatoCMS... ${info.payload.percent}%)`;
            }

            spinner.text = progress.changeText(text);
          },
        });

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

        spinner.text = progress.changeText(
          `Asset #${asset.sys.id.toString()} (finalize upload...)`,
        );

        const upload = await datoClient.uploads.create({
          path,
          author: null,
          copyright: null,
          defaultFieldMetadata,
        });

        uploadsMapping[asset.sys.id.toString()] = upload.id;
        writeToFile({ uploadsMapping });
      } catch (error) {
        if (
          error.errorWithCode &&
          error.errorWithCode('PLAN_UPGRADE_REQUIRED')
        ) {
          throw error;
        }

        console.error(
          `Could not upload Contentful asset with ID ${asset.sys.id}`,
        );

        uploadsMapping[asset.sys.id.toString()] = null;
      }
    }

    spinner.succeed();
    return uploadsMapping;
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
