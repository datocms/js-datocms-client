const rawUploadFile = process.browser
  ? require('./adapters/browser').default
  : require('./adapters/node').default;

export default function createUploadPath(client, source, options) {
  const { promise, cancel } = rawUploadFile(client, source, options);
  // For backwards compatibility reasons we set cancel on the promise
  promise.cancel = cancel;
  return promise;
}
