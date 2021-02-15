import got from 'got';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

function uploadToS3(url, filePath, { onProgress }) {
  const totalLength = fs.statSync(filePath).size;
  let isCancelled = false;
  const promise = got.put(url, {
    headers: {
      'Content-Type': mime.lookup(filePath),
      'Content-Length': totalLength,
    },
    responseType: 'json',
    body: fs.createReadStream(filePath),
  });
  if (typeof onProgress === 'function') {
    promise.on('uploadProgress', ({ percent }) => {
      if (!isCancelled) {
        onProgress({
          type: 'upload',
          payload: { percent: Math.round(percent * 100) },
        });
      }
    });
  }

  return {
    promise: promise.catch(error => {
      if (error instanceof got.CancelError) {
        throw new Error('upload aborted');
      }
      throw error;
    }),
    cancel: () => {
      isCancelled = true;
      promise.cancel();
    },
  };
}

export default function nodeLocal(client, filePath, options) {
  let isCancelled = false;
  let cancel = () => {
    isCancelled = true;
  };
  const promise = client.uploadRequest
    .create({ filename: options.filename || path.basename(filePath) })
    .then(({ id, url }) => {
      if (isCancelled) {
        return Promise.reject(new Error('upload aborted'));
      }
      if (options.onProgress) {
        options.onProgress({
          type: 'uploadRequestComplete',
          payload: {
            id,
            url,
          },
        });
      }
      const { promise: uploadPromise, cancel: cancelUpload } = uploadToS3(
        url,
        filePath,
        {
          onProgress: options.onProgress,
        },
      );
      cancel = cancelUpload;
      return uploadPromise.then(() => id);
    });

  return {
    promise,
    cancel: () => {
      return cancel();
    },
  };
}
