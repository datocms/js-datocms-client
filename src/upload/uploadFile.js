import createUploadPath from './createUploadPath';

export default function uploadFile(
  client,
  source,
  uploadAttributes = {},
  fieldAttributes = {},
  options = {},
) {
  const uploadPathPromise = createUploadPath(client, source, options);
  const promise = uploadPathPromise
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
  promise.cancel = uploadPathPromise.cancel;
  return promise;
}
