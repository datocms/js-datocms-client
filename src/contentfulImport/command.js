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
    contentfulEnvironment
  });

  await removeAllValidators({ datoClient, contentfulData });

  await destroyExistingModels({ datoClient, contentfulData });

  await destroyExistingAssets({ datoClient });

  await setLocales({ datoClient, contentfulData });

  const itemTypes = await createModels({ datoClient, contentfulData });

  const fieldsMapping = await createFields({
    itemTypes,
    datoClient,
    contentfulData,
  });

  if (!skipContent) {
    const { contentfulRecordMap, recordsToPublish } = await createRecords({
      itemTypes,
      fieldsMapping,
      datoClient,
      contentfulData,
    });

    await createUploads({
      fieldsMapping,
      itemTypes,
      datoClient,
      contentfulData,
      contentfulRecordMap,
    });

    // publish all records that should be published...
    await publishRecords({
      recordIds: recordsToPublish,
      datoClient,
    });

    // ... and link records afterwards, to make it simple. If we link before
    // wou would need to build a tree structure and publish in the correct order...
    const linkedRecords = await linkRecords({
      fieldsMapping,
      datoClient,
      contentfulData,
      contentfulRecordMap,
    });

    // ...but then we need to re-publish the records that
    // had link fields set.
    await publishRecords({
      recordIds: linkedRecords,
      datoClient,
    });
  }

  await addValidationsOnField({
    itemTypes,
    fieldsMapping,
    datoClient,
    contentfulData,
  });
};
