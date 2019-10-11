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
        const path = await dato.createUploadPath(mediaItemUrl);
        const upload = await dato.uploads.create({
          path,
          author: null,
          copyright: null,
          defaultFieldMetadata: {
            en: {
              title: mediaItem.title.rendered,
              alt: mediaItem.alt_text,
              customData: {},
            }
          }
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
