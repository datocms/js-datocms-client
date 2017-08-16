/* global fetch */

import uploadFile from './uploadFile';

export default function uploadImage(client, source) {
  return uploadFile(client, source)
  .then((hash) => {
    if (hash.format === 'svg') {
      return Promise.resolve(
        Object.assign(hash, { width: null, height: null })
      );
    }

    return fetch(`https://www.datocms-assets.com${hash.path}?fm=json`)
      .then(res => res.json())
      .then(({ PixelHeight, PixelWidth }) => {
        return Object.assign(
          { height: PixelHeight, width: PixelWidth },
          hash
        );
      });
  });
}

