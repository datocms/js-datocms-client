import convertToRegExp from 'escape-string-regexp';
import allPages from '../utils/allPages';

const { progress } = require('../utils/progress');

export default async function pages(dato, wp, schema, media, authors) {
  const resources = await allPages('Fetching pages', wp.pages());

  const tick = progress('Creating pages', resources.length);

  for (const page of resources) {
    const createAndPublish = async () => {
      const newItem = await dato.items.create({
        itemType: schema.pageId,
        title: page.title.rendered,
        slug: page.slug,
        content: Object.entries(media.urls)
          .reduce((acc, [k, v]) => (
            acc.replace(new RegExp(convertToRegExp(k), 'ig'), v)
          ), page.content.rendered),
        excerpt: Object.entries(media.urls)
          .reduce((acc, [k, v]) => (
            acc.replace(new RegExp(convertToRegExp(k), 'ig'), v)
          ), page.excerpt.rendered),
        date: page.date,
        author: authors[page.author],
        featuredMedia: media.ids[page.featured_media],
      });

      if (page.status === 'publish' || page.status === 'future') {
        await dato.items.publish(newItem.id);
      }
    };

    await tick(page.title.rendered, createAndPublish());
  }
}
