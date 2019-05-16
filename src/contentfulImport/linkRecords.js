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
  const spinner = ora('').start();
  const { entries, defaultLocale } = contentfulData;
  const progress = new Progress(entries.length, 'Linking records');
  const recordsToPublish = [];

  spinner.text = progress.tick();

  for (const entry of entries) {
    const { contentType } = entry.sys;
    const contentTypeApiKey = toItemApiKey(contentType.sys.id);

    const datoItemId = contentfulRecordMap[entry.sys.id];

    const itemTypeFields = fieldsMapping[contentTypeApiKey];

    const recordAttributes = Object.entries(entry.fields).reduce((outerAcc, [option, value]) => {
      const apiKey = toFieldApiKey(option);
      const field = itemTypeFields.find(itemTypefield => itemTypefield.apiKey === apiKey);

      if (field.fieldType !== 'link' && field.fieldType !== 'links') {
        return outerAcc;
      }

      if (field.localized) {
        const localizedValue = Object.keys(value)
          .reduce((innerAcc, locale) => {
            const innerValue = value[locale];
            if (field.fieldType === 'link') {
              return Object.assign(
                innerAcc, { [locale.slice(0, 2)]: contentfulRecordMap[innerValue.sys.id] },
              );
            }
            return Object.assign(innerAcc, {
              [locale.slice(0, 2)]: innerValue.filter(link => contentfulRecordMap[link.sys.id])
                .map(link => contentfulRecordMap[link.sys.id]),
            });
          }, {});

        const fallbackValues = contentfulData.locales.reduce((accLocales, locale) => {
          return Object.assign(
            accLocales, { [locale.slice(0, 2)]: localizedValue[defaultLocale.slice(0, 2)] },
          );
        }, {});

        return Object.assign(
          outerAcc, { [camelize(apiKey)]: { ...fallbackValues, ...localizedValue } },
        );
      }

      const innerValue = value[defaultLocale];

      if (field.fieldType === 'link') {
        return Object.assign(
          outerAcc, { [camelize(apiKey)]: contentfulRecordMap[innerValue.sys.id] },
        );
      }

      return Object.assign(outerAcc, {
        [camelize(apiKey)]: innerValue.filter(link => contentfulRecordMap[link.sys.id])
          .map(link => contentfulRecordMap[link.sys.id]),
      });
    }, {});

    try {
      // if no links found, no update needed.
      if (Object.entries(recordAttributes).length > 0) {
        await datoClient.items.update(datoItemId, recordAttributes);
        if (entry.sys.publishedVersion) {
          recordsToPublish.push(datoItemId);
        }
      }
      spinner.text = progress.tick();
    } catch (e) {
      spinner.fail(e);
      process.exit();
    }

    spinner.text = progress.tick();
  }
  spinner.succeed();
  return recordsToPublish;
};
