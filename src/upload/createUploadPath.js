const rawUploadFile = process.browser
  ? require('./adapters/browser').default
  : require('./adapters/node').default;

export default function createUploadPath(client, source) {
  return rawUploadFile(client, source);
}

