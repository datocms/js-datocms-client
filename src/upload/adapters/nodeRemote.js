import tmp from 'tmp';
import request from 'request';
import fs from 'fs';
import path from 'path';
import url from 'url';
import local from './nodeLocal';

export default function nodeUrl(client, fileUrl) {
  return new Promise((resolve, reject) => {
    tmp.dir((err, dir, cleanupCallback) => {
      if (err) {
        reject(err);
      }

      const { pathname } = url.parse(fileUrl);
      const filePath = path.join(dir, path.basename(pathname));
      const writeStream = fs.createWriteStream(filePath);

      request(fileUrl).pipe(writeStream);

      writeStream.on('close', () => {
        local(client, filePath)
          .then((result) => {
            fs.unlinkSync(filePath);
            cleanupCallback();
            resolve(result);
          });
      });
    });
  });
}
