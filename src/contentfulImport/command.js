import ora from 'ora';
import appClient from './appClient';
import getContentfulData from './getContentfulData';
import destroyExistingModels from './destroyExistingModels';
import destroyExistingAssets from './destroyExistingAssets';
import removeAllValidators from './removeAllValidators';
import setLocales from './setLocales';
import createModels from './createModels';
import createFields from './createFields';
import createRecords from './createRecords';
import addValidationsOnField from './addValidationsOnField';
import linkRecords from './linkRecords';
import createUploads from './createUploads';
import publishRecords from './publishRecords';
import {
  initializeCache,
  writeToFile,
  cached,
  destroyTempFile,
  promptForAction,
} from './cache';

export default async ({
  contentfulToken,
  contentfulSpaceId,
  contentfulEnvironment,
  datoCmsToken,
  datoCmsEnvironment,
  datoCmsCmaBaseUrl,
  skipContent,
  contentType,
}) => {
  try {
    await initializeCache();

    const message = `
*****Important Notice*****

Importing from Contentful is a potentially destructive operation. 
It will remove all your unused media assets, unused locales, and all models with the same name as Contentful's content types.
We strongly recommend to proceed using a clean environment.

Do you wish to continue? [Y/n]: `;

    await promptForAction(message, 'n', () => {
      throw new Error(`Import aborted`);
    });

    const client = await appClient(
      contentfulToken,
      contentfulSpaceId,
      datoCmsToken,
      datoCmsEnvironment,
      datoCmsCmaBaseUrl,
    );
    const datoClient = client.dato;
    const contentfulData = cached('contentfulData')
      ? cached('contentfulData')
      : await getContentfulData({
          client: client.contentful,
          skipContent,
          contentType,
          contentfulEnvironment,
        });

    writeToFile({ contentfulData });

    if (!cached('fieldsMapping')) {
      await removeAllValidators({ datoClient, contentfulData });
    }

    if (!cached('itemTypeMapping')) {
      await destroyExistingModels({ datoClient, contentfulData });
    }

    if (!cached('uploadsMapping')) {
      await destroyExistingAssets({ datoClient });
    }

    await setLocales({ datoClient, contentfulData });

    // itemTypeMapping = { <contentTypeId>: <ItemType> }
    const itemTypeMapping = cached('itemTypeMapping')
      ? cached('itemTypeMapping')
      : await createModels({ datoClient, contentfulData });

    writeToFile({ itemTypeMapping });

    // fieldsMapping = { <contentTypeId>: Array<{ datoField: Field, contentfulFieldId: string}> }
    const fieldsMapping = cached('fieldsMapping')
      ? cached('fieldsMapping')
      : await createFields({
          datoClient,
          itemTypeMapping,
          contentfulData,
        });

    writeToFile({ fieldsMapping });

    if (!skipContent) {
      // contentfulRecordMap = { <entryId>: <ItemId> }
      // recordsToPublish = Array<ItemId>
      const recordsMapping = cached('recordsMapping')
        ? cached('recordsMapping')
        : await createRecords({
            itemTypeMapping,
            fieldsMapping,
            datoClient,
            contentfulData,
          });

      writeToFile({ recordsMapping });

      const cachedUploads = cached('uploadsMapping');

      const uploadsMapping =
        cachedUploads &&
        Object.keys(cachedUploads).length === contentfulData.assets.length
          ? cachedUploads
          : await createUploads({
              datoClient,
              contentfulData,
            });

      writeToFile({ uploadsMapping });

      // publish all records that should be published...
      await publishRecords({
        recordIds: recordsMapping.recordsToPublish,
        datoClient,
      });

      // ... and link records afterwards, to make it simple. If we link before
      // wou would need to build a tree structure and publish in the correct order...
      const linkedRecords = await linkRecords({
        datoClient,
        fieldsMapping,
        contentfulData,
        contentfulRecordMap: recordsMapping.contentfulRecordMap,
        uploadsMapping,
      });

      // ...but then we need to re-publish the records that
      // had link fields set.
      await publishRecords({
        recordIds: linkedRecords,
        datoClient,
      });
    }

    await addValidationsOnField({
      fieldsMapping,
      datoClient,
      contentfulData,
    });

    const spinner = ora('Import completed! 🎉🎉🎉');

    destroyTempFile();

    spinner.succeed();
  } catch (e) {
    throw new Error(`Importer error:  ${JSON.stringify(e, null, 2)}`);
  }
};
