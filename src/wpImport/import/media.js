import crypto from 'crypto';
import fs from 'fs';
import allPages from '../utils/allPages';
import downloadLocally from '../../utils/downloadLocally';
import { progress } from '../utils/progress';

function calculateMd5(hashName, path) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(hashName);
    const stream = fs.createReadStream(path);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function createOrReturnExistingUpload(dato, url, attributes) {
  const { filePath, deleteTmpFile } = await downloadLocally(url).promise;

  try {
    const md5 = await calculateMd5('md5', filePath);

    const uploads = await dato.uploads.all({
      filter: { fields: { md5: { eq: md5 } } },
    });

    if (uploads.length > 0) {
      return uploads[0];
    }

    const path = await dato.createUploadPath(url);
    return await dato.uploads.create({ ...attributes, path });
  } finally {
    deleteTmpFile();
  }
}

export default async function media(dato, wp) {
  const ids = {};
  const urls = {};

  const mediaItems = await allPages('Fetching media', wp.media());

  const tick = progress('Creating media', mediaItems.length);

  for (const mediaItem of mediaItems) {
    const create = async () => {
      const mediaItemUrl = mediaItem.source_url;
      try {
        const upload = await createOrReturnExistingUpload(dato, mediaItemUrl, {
          defaultFieldMetadata: {
            en: {
              title: mediaItem.title.rendered,
              alt: mediaItem.alt_text,
              customData: {},
            },
          },
        });

        ids[mediaItem.id] = upload.id;
        urls[mediaItemUrl] = upload.url;

        if (mediaItem.media_details && mediaItem.media_details.sizes) {
          for (const thumbName of Object.keys(mediaItem.media_details.sizes)) {
            const {
              width,
              height,
              source_url: sourceUrl,
            } = mediaItem.media_details.sizes[thumbName];
            urls[sourceUrl] = `${upload.url}?w=${width}&h=${height}&fit=crop`;
          }
        }
      } catch (e) {
        console.log(`Cannot import: ${mediaItemUrl}`);
        console.log(e);
      }
    };

    await tick(mediaItem.title.rendered, create());
  }

  return { ids, urls };
}
