import ora from 'ora';
import Progress from './progress';
import generateRichToStructured from './richTextToStructuredText';

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
  const richTextToStructuredText = await generateRichToStructured(
    datoClient,
    contentfulRecordMap,
    uploadsMapping,
  );

  try {
    spinner.text = progress.tick();

    const datoValueForFieldType = async (value, field) => {
      if (field.fieldType === 'file') {
        return value && value.sys
          ? uploadData(uploadsMapping[value.sys.id])
          : null;
      }

      if (field.fieldType === 'link') {
        return value && value.sys ? contentfulRecordMap[value.sys.id] : null;
      }

      if (field.fieldType === 'links') {
        return value
          .map(link => {
            return link && link.sys ? contentfulRecordMap[link.sys.id] : null;
          })
          .filter(v => !!v);
      }

      if (field.fieldType === 'gallery') {
        return value
          .map(link => {
            return link && link.sys
              ? uploadData(uploadsMapping[link.sys.id])
              : null;
          })
          .filter(v => !!v);
      }

      if (field.fieldType === 'structured_text') {
        const structured = await richTextToStructuredText(value);
        return structured;
      }

      return value;
    };

    const recordsToPublish = [];

    for (const entry of entries) {
      const datoItemId = contentfulRecordMap[entry.sys.id];
      const datoFields = fieldsMapping[entry.sys.contentType.sys.id];
      let datoNewValue = {};

      if (!datoFields) {
        // eslint-disable-next-line no-continue
        continue;
      }

      for (const [id, contentfulItem] of Object.entries(entry.fields)) {
        const { datoField } = datoFields.find(f => f.contentfulFieldId === id);

        if (
          !['file', 'gallery', 'link', 'links', 'structured_text'].includes(
            datoField.fieldType,
          )
        ) {
          // eslint-disable-next-line no-continue
          continue;
        }

        if (datoField.localized) {
          for (const [locale, val] of Object.entries(contentfulItem)) {
            datoNewValue[locale] = await datoValueForFieldType(val, datoField);
          }
        } else {
          datoNewValue = await datoValueForFieldType(
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
