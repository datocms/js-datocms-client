import allPages from '../utils/allPages';

const { progress } = require('../utils/progress');

export default async function media(dato, wp) {
  const ids = {};
  const urls = {};

  const mediaItems = await allPages('Fetching media', wp.media());

  const tick = progress('Creating media', mediaItems.length);

  for (const mediaItem of mediaItems) {
    const create = async () => {
      const mediaItemUrl = mediaItem.source_url;
      try {
        const uploadId = await dato.uploadFile(mediaItemUrl);
        const upload = await dato.uploads.update(uploadId, {
          title: mediaItem.title.rendered,
          alt: mediaItem.alt_text,
        });

        ids[mediaItem.id] = uploadId;

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
