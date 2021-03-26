import ora from 'ora';
import Progress from './progress';

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
  datoClient,
  fieldsMapping,
  contentfulData,
  contentfulRecordMap,
  uploadsMapping,
}) => {
  const spinner = ora('').start();
  const { entries } = contentfulData;
  const progress = new Progress(entries.length, 'Create links');

  try {
    spinner.text = progress.tick();

    const datoValueForFieldType = (value, field) => {
      if (['file'].includes(field.fieldType)) {
        return value && value.sys
          ? uploadData(uploadsMapping[value.sys.id])
          : null;
      }

      if (['link'].includes(field.fieldType)) {
        return value && value.sys ? contentfulRecordMap[value.sys.id] : null;
      }

      if (['links'].includes(field.fieldType)) {
        return value
          .map(link => {
            return link && link.sys ? contentfulRecordMap[link.sys.id] : null;
          })
          .filter(v => !!v);
      }

      if (['gallery'].includes(field.fieldType)) {
        return value
          .map(link => {
            return link && link.sys
              ? uploadData(uploadsMapping[link.sys.id])
              : null;
          })
          .filter(v => !!v);
      }

      return value;
    };

    const recordsToPublish = [];

    for (const entry of entries) {
      const datoItemId = contentfulRecordMap[entry.sys.id];
      const datoFields = fieldsMapping[entry.sys.contentType.sys.id];
      let datoNewValue;

      if (!datoFields) {
        continue;
      }

      for (const [id, contentfulItem] of Object.entries(entry.fields)) {
        const { datoField } = datoFields.find(f => f.contentfulFieldId === id);

        if (
          !['file', 'gallery', 'link', 'links'].includes(datoField.fieldType)
        ) {
          // eslint-disable-next-line no-continue
          continue;
        }

        if (datoField.localized) {
          datoNewValue = Object.entries(contentfulItem).reduce(
            (innerAcc, [locale, innerValue]) => {
              const value = datoValueForFieldType(innerValue, datoField);
              return value
                ? {
                    ...innerAcc,
                    [locale]: value,
                  }
                : { ...innerAcc };
            },
            {},
          );
        } else {
          datoNewValue = datoValueForFieldType(
            contentfulItem[contentfulData.defaultLocale],
            datoField,
          );
        }

        const recordAttributes = { [camelize(datoField.apiKey)]: datoNewValue };

        await datoClient.items.update(datoItemId, recordAttributes);

        if (entry.sys.publishedVersion) {
          recordsToPublish.push(datoItemId);
        }
      }
      spinner.text = progress.tick();
    }

    spinner.succeed();
    return recordsToPublish;
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
