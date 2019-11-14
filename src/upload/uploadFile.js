import createUploadPath from './createUploadPath';

export default function uploadFile(
  client,
  source,
  uploadAttributes = {},
  fieldAttributes = {},
) {
  return createUploadPath(client, source)
    .then(path => {
      return client.uploads.create({
        ...uploadAttributes,
        path,
      });
    })
    .then(upload => {
      return Promise.resolve({
        alt: null,
        title: null,
        customData: {},
        ...fieldAttributes,
        uploadId: upload.id,
      });
    });
}
