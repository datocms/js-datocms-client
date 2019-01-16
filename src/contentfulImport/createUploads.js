import ora from 'ora';
import Progress from './progress';
import { toItemApiKey, toFieldApiKey } from './toApiKey';

const { camelize } = require('humps');

export default async ({
  fieldsMapping,
  datoClient,
  contentfulData,
  contentfulRecordMap,
}) => {
  let spinner = ora('').start();
  const { entries, assets, defaultLocale } = contentfulData;

  let progress = new Progress(assets.length, 'Uploading assets');
  spinner.text = progress.tick();

  const contentfulAssetsMap = {};

  for (const asset of assets) {
    if (asset.fields && asset.fields.file) {
      const fileAttributes = asset.fields.file[defaultLocale];
      const fileUrl = `https:${fileAttributes.url}`;
      let datoUpload;
      let upload;

      try {
        datoUpload = await datoClient.uploadFile(fileUrl);

        upload = await datoClient.uploads.update(datoUpload, {
          title: fileAttributes.fileName,
          alt: fileAttributes.fileName,
        });

        contentfulAssetsMap[asset.sys.id] = upload.id;
        spinner.text = progress.tick();
      } catch (e) {
        if (
          e.body
            && e.body.data
            && e.body.data.some(d => d.id === 'FILE_STORAGE_QUOTA_EXCEEDED')
        ) {
          spinner.fail('You\'ve reached your site\'s plan storage limit: upgrade to complete the import');
        } else {
          spinner.fail(e);
        }
        process.exit();
      }
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
    try {
      for (const key of Object.keys(entry.fields)) {
        const entryFieldValue = entry.fields[key];
        const contentTypeApiKey = toItemApiKey(entry.sys.contentType.sys.id);
        const apiKey = toFieldApiKey(key);

        const field = fieldsMapping[contentTypeApiKey].find(f => f.apiKey === apiKey);

        let uploadedFile = null;

        if (field.fieldType === 'file' || field.fieldType === 'gallery') {
          if (field.localized) {
            const localizedValue = Object.keys(entryFieldValue)
              .reduce((innerAcc, locale) => {
                const innerValue = entryFieldValue[locale];
                if (field.fieldType === 'file') {
                  return Object.assign(
                    innerAcc, { [locale.slice(0, 2)]: contentfulAssetsMap[innerValue.sys.id] },
                  );
                }
                return Object.assign(innerAcc, {
                  [locale.slice(0, 2)]: innerValue.map(link => contentfulAssetsMap[link.sys.id]),
                });
              }, {});
            const fallbackValues = contentfulData.locales.reduce((innerAcc, locale) => {
              return Object.assign(
                innerAcc, { [locale.slice(0, 2)]: localizedValue[defaultLocale.slice(0, 2)] },
              );
            }, {});

            recordAttributes = Object.assign(
              recordAttributes, { [camelize(apiKey)]: { ...fallbackValues, ...localizedValue } },
            );
          } else {
            const innerValue = entryFieldValue[defaultLocale];

            switch (field.fieldType) {
              case 'file':
                uploadedFile = contentfulAssetsMap[innerValue.sys.id];
                break;
              case 'gallery':
                uploadedFile = innerValue.map((link) => {
                  return contentfulAssetsMap[link.sys.id];
                });
                break;
              default:
                break;
            }

            recordAttributes = Object.assign(recordAttributes, {
              [camelize(apiKey)]: uploadedFile,
            });
          }
        }
      }
      await datoClient.items.update(datoItemId, recordAttributes);
      spinner.text = progress.tick();
    } catch (e) {
      spinner.fail(e);
      process.exit();
    }
  }

  spinner.succeed();
};
