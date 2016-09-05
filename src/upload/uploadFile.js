/* eslint-disable global-require */

export default function uploadFile(client, source) {
  if (process.env.APP_ENV === 'browser') {
    const adapter = require('./adapters/browser');
    return adapter(client, source);
  }

  const adapter = require('./adapters/node');
  return adapter(client, source);
}
