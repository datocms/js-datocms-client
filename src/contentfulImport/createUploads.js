import ora from 'ora';
import Progress from './progress';
import { toItemApiKey, toFieldApiKey } from './toApiKey';

const { camelize } = require('humps');

function uploadData(id) {
  if (!id) {
    return null;
  }

  return {
    uploadId: id,
    alt: null,
    title: null,
    customData: {},
  };
}

export default async ({
  fieldsMapping,
  datoClient,
  contentfulData,
  contentfulRecordMap,
}) => {
  let spinner = ora('').start();

  try {
    const { entries, assets } = contentfulData;

    let progress = new Progress(assets.length, 'Uploading assets');
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
                alt: asset.fields.title[locale],
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

        spinner.text = progress.tick();
      } else {
        spinner.text = progress.tick();
      }
    }
    spinner.succeed();
    spinner = ora('').start();
    progress = new Progress(entries.length, 'Linking assets to records');
    spinner.text = progress.tick();

    for (const entry of entries) {
      const datoItemId = contentfulRecordMap[entry.sys.id];
      let recordAttributes = {};

      for (const key of Object.keys(entry.fields)) {
        const entryFieldValue = entry.fields[key];

        const contentTypeApiKey = toItemApiKey(entry.sys.contentType.sys.id);
        const apiKey = toFieldApiKey(key);

        const field = fieldsMapping[contentTypeApiKey].find(
          f => f.apiKey === apiKey,
        );

        let fileFieldAttributes = null;

        if (field.fieldType === 'file' || field.fieldType === 'gallery') {
          if (field.localized) {
            const localizedValue = Object.keys(entryFieldValue).reduce(
              (innerAcc, locale) => {
                const innerValue = entryFieldValue[locale];
                if (field.fieldType === 'file') {
                  return Object.assign(innerAcc, {
                    [locale]: uploadData(
                      contentfulAssetsMap[innerValue.sys.id],
                    ),
                  });
                }
                return Object.assign(innerAcc, {
                  [locale]: innerValue
                    .map(link => uploadData(contentfulAssetsMap[link.sys.id]))
                    .filter(v => !!v),
                });
              },
              {},
            );

            const fallbackValues = contentfulData.locales.reduce(
              (innerAcc, locale) => {
                return Object.assign(innerAcc, {
                  [locale]: localizedValue[contentfulData.defaultLocale],
                });
              },
              {},
            );

            recordAttributes = Object.assign(recordAttributes, {
              [camelize(apiKey)]: { ...fallbackValues, ...localizedValue },
            });
          } else {
            const innerValue = entryFieldValue[contentfulData.defaultLocale];

            switch (field.fieldType) {
              case 'file':
                fileFieldAttributes = uploadData(
                  contentfulAssetsMap[innerValue.sys.id],
                );
                break;
              case 'gallery':
                fileFieldAttributes = innerValue
                  .map(link => uploadData(contentfulAssetsMap[link.sys.id]))
                  .filter(v => !!v);
                break;
              default:
                break;
            }

            recordAttributes = Object.assign(recordAttributes, {
              [camelize(apiKey)]: fileFieldAttributes,
            });
          }
        }
      }

      // if no file/gallery is found, no update needed.
      if (Object.entries(recordAttributes).length > 0) {
        await datoClient.items.update(datoItemId, recordAttributes);
      }

      spinner.text = progress.tick();
    }

    spinner.succeed();
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
