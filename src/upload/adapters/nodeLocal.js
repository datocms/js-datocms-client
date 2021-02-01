import axios from 'axios';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

function uploadToS3(url, filePath, { onProgress }) {
  const totalLength = fs.statSync(filePath).size;
  const cancelTokenSource = axios.CancelToken.source();

  const promise = axios({
    url,
    method: 'put',
    headers: {
      'Content-Type': mime.lookup(filePath),
      'Content-Length': totalLength,
    },
    data: fs.createReadStream(filePath),
    transformRequest: [
      data => {
        let progressLength = 0;
        const listener = chunk => {
          progressLength += chunk.length;
          if (onProgress) {
            onProgress({
              type: 'upload',
              payload: {
                percent: Math.round((progressLength * 100) / totalLength),
              },
            });
          }
        };
        data.on('data', listener);
        return data;
      },
    ],
    maxContentLength: 1000000000,
    maxBodyLength: 1000000000,
    cancelToken: cancelTokenSource.token,
  });
  return {
    promise,
    cancel: () => cancelTokenSource.cancel('aborted'),
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
