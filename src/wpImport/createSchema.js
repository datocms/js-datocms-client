import createAuthorModel from './schema/author';
import createCategoryModel from './schema/category';
import createTagModel from './schema/tag';
import createArticleModel from './schema/article';
import createPageModel from './schema/page';
import { progress } from './utils/progress';

export default async function createSchema(dato) {
  const tick = progress('Creating DatoCMS models', 4);

  const authorId = await tick('Author model', createAuthorModel(dato));
  const categoryId = await tick('Category model', createCategoryModel(dato));
  const tagId = await tick('Tag model', createTagModel(dato));

  const pageId = await tick(
    'Page model',
    createPageModel(dato, authorId, categoryId, tagId),
  );

  const articleId = await tick(
    'Article model',
    createArticleModel(dato, authorId, categoryId, tagId),
  );

  return {
    authorId, categoryId, tagId, articleId, pageId,
  };
}
