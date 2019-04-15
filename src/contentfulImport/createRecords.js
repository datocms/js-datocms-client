import ora from 'ora';
import Progress from './progress';
import { toItemApiKey, toFieldApiKey } from './toApiKey';

const { camelize } = require('humps');

export default async ({
  itemTypes, fieldsMapping, datoClient, contentfulData,
}) => {
  const spinner = ora('').start();
  const { entries, defaultLocale } = contentfulData;
  const progress = new Progress(entries.length, 'Creating records');

  const contentfulRecordMap = {};

  spinner.text = progress.tick();

  for (const entry of entries) {
    const { contentType } = entry.sys;
    const contentTypeApiKey = toItemApiKey(contentType.sys.id);

    const itemType = itemTypes.find((iT) => {
      return iT.apiKey === contentTypeApiKey;
    });

    const itemTypeFields = fieldsMapping[contentTypeApiKey];

    if (itemType) {
      const emptyFieldValues = itemTypeFields.reduce((accFields, field) => {
        if (field.localized) {
          const value = contentfulData.locales
            .map(locale => locale.slice(0, 2))
            .reduce((accLocales, locale) => Object.assign(accLocales, { [locale]: null }), {});
          return Object.assign(accFields, { [camelize(field.apiKey)]: value });
        }
        return Object.assign(accFields, { [camelize(field.apiKey)]: null });
      }, {});

      const recordAttributes = Object.entries(entry.fields).reduce((acc, [option, value]) => {
        const apiKey = toFieldApiKey(option);
        const field = itemTypeFields.find(f => f.apiKey === apiKey);
        switch (field.fieldType) {
          case 'link':
          case 'links':
          case 'file':
          case 'gallery':
            return acc;
          default:
            break;
        }

        if (field.localized) {
          const localizedValue = Object.keys(value)
            .reduce((innerAcc, locale) => {
              let innerValue = value[locale];

              if (field.fieldType === 'lat_lon') {
                innerValue = {
                  latitude: innerValue.lat,
                  longitude: innerValue.lon,
                };
              }

              if (field.fieldType === 'string' && Array.isArray(innerValue)) {
                innerValue = innerValue.join(', ');
              }

              if (field.fieldType === 'json') {
                innerValue = JSON.stringify(innerValue, null, 2);
              }
              return Object.assign(innerAcc, { [locale.slice(0, 2)]: innerValue });
            }, {});

          const fallbackValues = contentfulData.locales.reduce((accLocales, locale) => {
            return Object.assign(
              accLocales, { [locale.slice(0, 2)]: localizedValue[defaultLocale.slice(0, 2)] },
            );
          }, {});

          return Object.assign(
            acc, { [camelize(apiKey)]: { ...fallbackValues, ...localizedValue } },
          );
        }
        let innerValue = value[defaultLocale];

        if (field.fieldType === 'lat_lon') {
          innerValue = {
            latitude: innerValue.lat,
            longitude: innerValue.lon,
          };
        }

        if (field.fieldType === 'string' && Array.isArray(innerValue)) {
          innerValue = innerValue.join(', ');
        }

        if (field.fieldType === 'json') {
          innerValue = JSON.stringify(innerValue, null, 2);
        }
        return Object.assign(acc, { [camelize(apiKey)]: innerValue });
      }, emptyFieldValues);

      try {
        const record = await datoClient.items.create({
          ...recordAttributes,
          itemType: itemType.id.toString(),
        });

        if (entry.sys.publishedVersion) {
          await datoClient.items.publish(record.id);
        }

        spinner.text = progress.tick();
        contentfulRecordMap[entry.sys.id] = record.id;
      } catch (e) {
        if (
          e.body
            && e.body.data
            && e.body.data.some(d => d.id === 'ITEMS_QUOTA_EXCEEDED')
        ) {
          spinner.fail('You\'ve reached your site\'s plan record limit: upgrade to complete the import');
        } else {
          spinner.fail(e);
        }
        process.exit();
      }
    }
  }

  spinner.succeed();

  return contentfulRecordMap;
};
