/* global fetch */

import uploadFile from './uploadFile';

const wait = ms => new Promise(r => setTimeout(r, ms));

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

export default function uploadImage(client, source) {
  return uploadFile(client, source)
  .then((hash) => {
    if (hash.format === 'svg') {
      return Promise.resolve(
        Object.assign(hash, { width: null, height: null })
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
  });
}

