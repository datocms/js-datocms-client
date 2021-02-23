import convertToRegExp from 'escape-string-regexp';
import allPages from '../utils/allPages';

const { progress } = require('../utils/progress');

export default async function articles(
  dato,
  wp,
  schema,
  media,
  categories,
  tags,
  authors,
) {
  const resources = await allPages('Fetching articles', wp.posts());

  const tick = progress('Creating articles', resources.length);

  for (const article of resources) {
    const newCategories = article.categories.map(id => categories[id]);
    const newTags = article.tags.map(id => tags[id]);

    const createAndPublish = async () => {
      const itemData = {
        itemType: schema.articleId,
        title: article.title.rendered,
        slug: article.slug,
        content: Object.entries(media.urls).reduce(
          (acc, [k, v]) => acc.replace(new RegExp(convertToRegExp(k), 'ig'), v),
          article.content.rendered,
        ),
        excerpt: Object.entries(media.urls).reduce(
          (acc, [k, v]) => acc.replace(new RegExp(convertToRegExp(k), 'ig'), v),
          article.excerpt.rendered,
        ),
        date: article.date,
        author: authors[article.author],
        categories: newCategories,
        tags: newTags,
        featuredMedia: null,
        meta: {
          firstPublishedAt: new Date(article.date),
          createdAt: new Date(article.date),
        },
      };

      if (media.ids[article.featured_media]) {
        itemData.featuredMedia = {
          uploadId: media.ids[article.featured_media],
          title: article.title.rendered,
          alt: article.title.rendered,
          customData: {},
        };
      }

      const newItem = await dato.items.create(itemData);

      if (article.status === 'publish' || article.status === 'future') {
        await dato.items.publish(newItem.id);
      }
    };

    await tick(article.title.rendered, createAndPublish());
  }
}
