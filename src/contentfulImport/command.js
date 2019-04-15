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

export default async (contentfulToken, contentfulSpaceId, datoCmsToken, skipContent) => {
  const client = await appClient(contentfulToken, contentfulSpaceId, datoCmsToken);
  const datoClient = client.dato;
  const contentfulData = await getContentfulData(client.contentful, skipContent);

  await removeAllValidators({ datoClient, contentfulData });

  await destroyExistingModels({ datoClient, contentfulData });

  await destroyExistingAssets({ datoClient });

  await setLocales({ datoClient, contentfulData });

  const itemTypes = await createModels({ datoClient, contentfulData });

  const fieldsMapping = await createFields({ itemTypes, datoClient, contentfulData });

  if (!skipContent) {
    const contentfulRecordMap = await createRecords({
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

    await linkRecords({
      fieldsMapping,
      datoClient,
      contentfulData,
      contentfulRecordMap,
    });

    await publishRecords({
      contentfulData,
      contentfulRecordMap,
      datoClient
    });
  }

  await addValidationsOnField({
    itemTypes, fieldsMapping, datoClient, contentfulData,
  });
};
