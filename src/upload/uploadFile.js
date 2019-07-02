const rawUploadFile = process.browser
  ? require('./adapters/browser').default
  : require('./adapters/node').default;

export default function uploadFile(client, source) {
  return rawUploadFile(client, source)
    .then((attributes) => {
      return client.uploads.create(attributes);
    })
    .then((upload) => {
      return Promise.resolve(upload.id);
    });
}
