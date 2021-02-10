import got from 'got';
import path from 'path';
import fs from 'fs';
import stream from 'stream';
import { promisify } from 'util';
import mime from 'mime-types';

const pipeline = promisify(stream.pipeline);

function uploadToS3(url, filePath, { onProgress }) {
  const totalLength = fs.statSync(filePath).size;
  let aborted = false;
  const uploadStream = got.stream.put(url, {
    headers: {
      'Content-Type': mime.lookup(filePath),
      'Content-Length': totalLength,
    },
    responseType: 'json',
  });

  if (typeof onProgress === 'function') {
    uploadStream.on('uploadProgress', ({ percent }) => {
      if (!aborted) {
        onProgress({
          type: 'upload',
          payload: { percent: Math.round(percent * 100) },
        });
      }
    });
  }

  const promise = pipeline(fs.createReadStream(filePath), uploadStream).catch(
    error => {
      if (aborted) {
        throw new Error('aborted');
      } else {
        throw error;
      }
    },
  );

  return {
    promise,
    cancel: () => {
      aborted = true;
      uploadStream.destroy();
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
