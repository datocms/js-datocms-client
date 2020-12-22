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
    const client = await appClient(
      contentfulToken,
      contentfulSpaceId,
      datoCmsToken,
      datoCmsEnvironment,
      datoCmsCmaBaseUrl,
    );
    const datoClient = client.dato;
    const contentfulData = await getContentfulData({
      client: client.contentful,
      skipContent,
      contentType,
      contentfulEnvironment,
    });

    await removeAllValidators({ datoClient, contentfulData });

    await destroyExistingModels({ datoClient, contentfulData });

    await destroyExistingAssets({ datoClient });

    await setLocales({ datoClient, contentfulData });

    // itemTypeMapping = { <contentTypeId>: <ItemType> }
    const itemTypeMapping = await createModels({ datoClient, contentfulData });

    // fieldsMapping = { <contentTypeId>: Array<{ datoField: Field, contentfulFieldId: string}> }
    const fieldsMapping = await createFields({
      datoClient,
      itemTypeMapping,
      contentfulData,
    });

    if (!skipContent) {
      // contentfulRecordMap = { <entryId>: <ItemId> }
      // recordsToPublish = Array<ItemId>
      const { contentfulRecordMap, recordsToPublish } = await createRecords({
        itemTypeMapping,
        fieldsMapping,
        datoClient,
        contentfulData,
      });

      const contentfulAssetsMap = await createUploads({
        datoClient,
        contentfulData,
      });

      // publish all records that should be published...
      await publishRecords({
        recordIds: recordsToPublish,
        datoClient,
      });

      // ... and link records afterwards, to make it simple. If we link before
      // wou would need to build a tree structure and publish in the correct order...
      const linkedRecords = await linkRecords({
        datoClient,
        fieldsMapping,
        contentfulData,
        contentfulRecordMap,
        contentfulAssetsMap,
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
    spinner.succeed();
  } catch (e) {
    console.error('Importer error:', e);
    throw e;
  }
};
