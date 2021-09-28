import tmp from 'tmp';
import got from 'got';
import fs from 'fs';
import path from 'path';
import url from 'url';
import decode from './decode';

export default function downloadLocally(fileUrl, options) {
  let isCancelled = false;
  let request = null;

  const start = async () => {
    const { name: tmpDir, removeCallback: deleteTmpDir } = tmp.dirSync();

    const encodedFileUrl = decode(fileUrl);
    request = got(encodedFileUrl, { responseType: 'buffer', maxRedirects: 10 });

    if (typeof options.onProgress === 'function') {
      request.on('downloadProgress', ({ percent }) => {
        if (isCancelled) {
          return;
        }

        options.onProgress({
          type: 'download',
          payload: { percent: Math.round(percent * 100) },
        });
      });
    }

    try {
      const response = await request;
      const { pathname } = url.parse(decode(response.url));
      const filePath = path.join(tmpDir, path.basename(pathname));
      fs.writeFileSync(filePath, response.body);

      return {
        filePath,
        deleteTmpFile: () => {
          fs.unlinkSync(filePath);
          deleteTmpDir();
        },
      };
    } catch (e) {
      deleteTmpDir();

      if (e instanceof got.CancelError) {
        throw new Error('upload aborted');
      } else if (e.response) {
        throw new Error(
          `Invalid status code for ${encodedFileUrl}: ${e.response.statusCode}`,
        );
      } else {
        throw e;
      }
    }
  };

  return {
    promise: start(),
    cancel: () => {
      isCancelled = true;
      if (request) {
        request.cancel();
      }
    },
  };
}
