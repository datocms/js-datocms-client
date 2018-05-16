import isBrowser from '../isBrowser';

/* global fetch */
const rawUploadFile = (client, source) => {
  if (isBrowser) {
    const adapter = require('./adapters/browser');
    return adapter(client, source);
  }

  const adapter = require('./adapters/node');
  return adapter(client, source);
}

// const wait = ms => new Promise(r => setTimeout(r, ms));
const wait = () => Promise.resolve();

const imageFormats = ['png', 'jpg', 'jpeg', 'gif'];

const retryOperation = (operation, delay, times) => new Promise((resolve, reject) => {
  return operation()
    .then(resolve)
    .catch((reason) => {
      if (times - 1 > 0) {
        return wait(delay)
          .then(retryOperation.bind(null, operation, delay, times - 1))
          .then(resolve)
          .catch(reject);
      }
      return reject(reason);
    });
});

const fetchJson = url => fetch(url).then((res) => {
  if (res.status === 200) {
    return res.json();
  }

  throw res.status;
});

export default function uploadFile(client, source) {
  return rawUploadFile(client, source)
  .then((hash) => {
    if (imageFormats.indexOf(hash.format) < 0) {
      return Promise.resolve(
        Object.assign({ width: null, height: null }, hash)
      );
    }

    return retryOperation(
      fetchJson.bind(null, `https://www.datocms-assets.com${hash.path}?fm=json`),
      500,
      5
    ).then(({ PixelHeight, PixelWidth }) => {
      return Object.assign(
        { height: PixelHeight, width: PixelWidth },
        hash
      );
    });
  }).then((attributes) => {
    return client.uploads.create(
      Object.assign(
        {alt: '', title: ''},
        attributes,
      )
    );
  }).then((upload) => {
    return Promise.resolve(upload.id);
  });
}
