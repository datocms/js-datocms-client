import axios from 'axios';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';

function uploadToS3(url, filePath) {
  return axios({
    url,
    method: 'put',
    headers: {
      'content-type': mime.lookup(filePath),
    },
    data: fs.readFileSync(filePath),
  });
}

export default function nodeLocal(client, filePath) {
  return client.uploadRequest.create({ filename: path.basename(filePath) })
    .then(({ id, url }) => {
      return uploadToS3(url, filePath)
        .then(() => ({ path: id }));
    });
}
