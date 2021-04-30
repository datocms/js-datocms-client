import ora from 'ora';
import promiseLimit from 'promise-limit';
import { camelize } from 'humps';
import Progress from './progress';

const datoValueForFieldType = async (value, field) => {
  // Fills link and media fields temporarly. They will be valorized once we create all items and files
  if (['links', 'gallery'].includes(field.fieldType)) {
    return [];
  }

  if (['link', 'file'].includes(field.fieldType)) {
    return null;
  }

  if (field.fieldType === 'structured_text') {
    // skip for now
    return null;
  }

  if (field.fieldType === 'lat_lon') {
    return (
      value && {
        latitude: value.lat,
        longitude: value.lon,
      }
    );
  }

  if (field.fieldType === 'string' && Array.isArray(value)) {
    return value && value.join(', ');
  }

  if (field.fieldType === 'json') {
    return value && JSON.stringify(value, null, 2);
  }

  return value;
};

export default async ({
  itemTypeMapping,
  fieldsMapping,
  datoClient,
  contentfulData,
}) => {
  const spinner = ora('').start();

  try {
    const { entries } = contentfulData;
    const progress = new Progress(entries.length, 'Creating records');
    const contentfulRecordMap = {};
    const recordsToPublish = [];

    spinner.text = progress.tick();

    const limit = promiseLimit(5);
    const jobs = [];

    for (const entry of entries) {
      const { contentType } = entry.sys;

      const itemType = itemTypeMapping[contentType.sys.id];

      if (!itemType) {
        // eslint-disable-next-line no-continue
        continue;
      }

      const datoFields = fieldsMapping[contentType.sys.id];

      // Contentful returns only valorized fields while Dato requires all the fields to be passed
      const allFieldApiKeys = [
        ...new Set([
          ...Object.keys(entry.fields),
          ...datoFields.map(f => f.contentfulFieldId),
        ]),
      ];

      const recordAttributes = {};

      for (const apiKey of allFieldApiKeys) {
        const contentfulContent = entry.fields[apiKey];

        const { datoField } = datoFields.find(
          f => f.contentfulFieldId === apiKey,
        );

        let datoFieldValue = {};

        if (datoField.localized) {
          for (const locale of contentfulData.locales) {
            datoFieldValue[locale] = await datoValueForFieldType(
              contentfulContent && contentfulContent[locale],
              datoField,
            );
          }
        } else {
          datoFieldValue = await datoValueForFieldType(
            contentfulContent &&
              contentfulContent[contentfulData.defaultLocale],
            datoField,
          );
        }

        recordAttributes[camelize(datoField.apiKey)] = datoFieldValue;
      }

      jobs.push(
        limit(async () => {
          const record = await datoClient.items.create({
            ...recordAttributes,
            itemType: itemType.id.toString(),
          });

          if (entry.sys.publishedVersion) {
            recordsToPublish.push(record.id);
          }

          spinner.text = progress.tick();
          contentfulRecordMap[entry.sys.id] = record.id;
        }),
      );
    }

    await Promise.all(jobs);

    spinner.succeed();

    return { contentfulRecordMap, recordsToPublish };
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
