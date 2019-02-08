import WPAPI from 'wpapi';
import SiteClient from '../site/SiteClient';

import destroyExistingData from './destroyExistingData';

import createSchema from './createSchema';

import importMedia from './import/media';
import importAuthors from './import/authors';
import importCategories from './import/categories';
import importTags from './import/tags';
import importArticles from './import/articles';
import importPages from './import/pages';

export default async function command(token, wpUrl, wpUser, wpPassword) {
  const dato = new SiteClient(token);

  const wp = await WPAPI.discover(wpUrl);
  await wp.auth({ username: wpUser, password: wpPassword });

  await destroyExistingData(dato, wp);

  const schema = await createSchema(dato, wp);
  const media = await importMedia(dato, wp);
  const categories = await importCategories(dato, wp, schema.categoryId);
  const tags = await importTags(dato, wp, schema.tagId);
  const authors = await importAuthors(dato, wp, schema.authorId);

  await importArticles(
    dato,
    wp,
    schema,
    media,
    categories,
    tags,
    authors,
  );

  await importPages(
    dato,
    wp,
    schema,
    media,
    authors,
  );
}
