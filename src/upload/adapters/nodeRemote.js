import tmp from 'tmp';
import axios from 'axios';
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

      return axios({
        url: fileUrl,
        maxRedirects: 10,
        responseType: 'arraybuffer',
      })
        .then((response) => {
          const { pathname } = url.parse(fileUrl);
          const filePath = path.join(dir, path.basename(pathname));
          fs.writeFileSync(filePath, Buffer.from(response.data));

          return local(client, filePath)
            .then((result) => {
              fs.unlinkSync(filePath);
              cleanupCallback();
              resolve(result);
            });
        })
        .catch((error) => {
          if (error.response) {
            reject(new Error(`Invalid status code for ${fileUrl}: ${error.response.status}`));
          } else {
            reject(error);
          }
        });
    });
  });
}
