import tmp from 'tmp';
import got from 'got';
import fs from 'fs';
import path from 'path';
import url from 'url';
import decode from '../../utils/decode';
import local from './nodeLocal';

export default function nodeUrl(client, fileUrl, options) {
  let isCancelled = false;
  let cancel = () => {
    isCancelled = true;
  };
  const promise = new Promise((resolve, reject) => {
    if (isCancelled) {
      return reject(new Error('upload aborted'));
    }
    return tmp.dir((err, dir, cleanupCallback) => {
      if (err) {
        cleanupCallback();
        reject(err);
        return;
      }

      if (isCancelled) {
        cleanupCallback();
        reject(new Error('upload aborted'));
        return;
      }

      const encodedFileUrl = decode(fileUrl);
      const request = got(encodedFileUrl, {
        responseType: 'buffer',
        maxRedirects: 10,
      }).catch(error => {
        if (isCancelled) {
          throw new Error('upload aborted');
        } else {
          throw error;
        }
      });

      cancel = () => {
        isCancelled = true;
        request.cancel();
        cleanupCallback();
        return;
      };

      if (typeof onProgress === 'function') {
        request.on('downloadProgress', ({ percent }) => {
          if (!isCancelled) {
            onProgress({
              type: 'download',
              payload: { percent: Math.round(percent * 100) },
            });
          }
        });
      }

      return request
        .then(async response => {
          /* eslint-disable no-underscore-dangle */
          const redirectedUrl =
            response.request._redirectable &&
            response.request._redirectable._redirectCount > 0
              ? response.request._redirectable._currentUrl
              : response.url;
          /* eslint-enable no-underscore-dangle */

          const { pathname } = url.parse(decode(response.url));
          const filePath = path.join(dir, path.basename(pathname));
          fs.writeFileSync(filePath, response.body);

          const { promise: uploadPromise, cancel: cancelUpload } = local(
            client,
            filePath,
            options,
          );
          cancel = () => {
            cancelUpload();
          };
          return uploadPromise.then(
            result => {
              fs.unlinkSync(filePath);
              cleanupCallback();
              resolve(result);
            },
            error => {
              fs.unlinkSync(filePath);
              cleanupCallback();
              throw error;
            },
          );
        })
        .catch(error => {
          if (error.response) {
            reject(
              new Error(
                `Invalid status code for ${encodedFileUrl}: ${error.response.statusCode}`,
              ),
            );
          } else {
            reject(error);
          }
        });
    });
  });
  return {
    promise,
    cancel: () => {
      cancel();
    },
  };
}
