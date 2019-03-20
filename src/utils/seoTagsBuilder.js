import { camelize } from 'humps';
import localizedRead from './localizedRead';
import buildFileUrl from './buildFileUrl';

const tag = (tagName, attributes) => ({ tagName, attributes });
const metaTag = (name, content) => tag('meta', { name, content });
const ogTag = (property, content) => tag('meta', { property, content });
const cardTag = (name, content) => tag('meta', { name, content });
const contentTag = (tagName, content) => ({ tagName, content });

function seoAttributeWithFallback(attribute, alternative, itemEntity, entitiesRepo, i18n) {
  const { site } = entitiesRepo;

  const fallbackSeo = site.globalSeo && site.globalSeo.fallbackSeo;
  const seoField = itemEntity && itemEntity.itemType.fields.find(f => f.fieldType === 'seo');

  const itemSeoValue = seoField
    && localizedRead(itemEntity, camelize(seoField.apiKey), seoField.localized, i18n)
    && localizedRead(itemEntity, camelize(seoField.apiKey), seoField.localized, i18n)[attribute];

  const fallbackSeoValue = fallbackSeo && fallbackSeo[attribute];

  return itemSeoValue || alternative || fallbackSeoValue;
}

export const builders = {
  title(itemEntity, entitiesRepo, i18n) {
    const { site } = entitiesRepo;

    const titleField = itemEntity && itemEntity.itemType.titleField;

    const title = seoAttributeWithFallback(
      'title',
      titleField
        && localizedRead(
          itemEntity,
          camelize(titleField.apiKey),
          titleField.localized,
          i18n,
        ),
      itemEntity, entitiesRepo, i18n,
    );

    if (title) {
      const suffix = (site.globalSeo && site.globalSeo.titleSuffix) || '';
      const titleWithSuffix = (title + suffix).length <= 60
        ? title + suffix
        : title;

      return [
        contentTag('title', titleWithSuffix),
        ogTag('og:title', title),
        cardTag('twitter:title', title),
      ];
    }

    return undefined;
  },

  description(itemEntity, entitiesRepo, i18n) {
    const description = seoAttributeWithFallback(
      'description',
      null,
      itemEntity, entitiesRepo, i18n,
    );

    if (description) {
      return [
        metaTag('description', description),
        ogTag('og:description', description),
        cardTag('twitter:description', description),
      ];
    }

    return undefined;
  },

  robots(itemEntity, entitiesRepo) {
    if (!entitiesRepo.site.noIndex) return undefined;

    return metaTag('robots', 'noindex');
  },

  twitterSite(itemEntity, entitiesRepo) {
    const { site } = entitiesRepo;

    if (site.globalSeo && site.globalSeo.twitterAccount) {
      return cardTag('twitter:site', site.globalSeo.twitterAccount);
    }

    return undefined;
  },

  twitterCard(itemEntity, entitiesRepo, i18n) {
    const card = seoAttributeWithFallback(
      'twitterCard',
      null,
      itemEntity, entitiesRepo, i18n,
    );

    return cardTag('twitter:card', card || 'summary');
  },

  articleModifiedTime(itemEntity) {
    if (!itemEntity) return undefined;

    const date = new Date(Date.parse(itemEntity.meta.updatedAt));

    return ogTag(
      'article:modified_time',
      `${date.toISOString().split('.')[0]}Z`,
    );
  },

  articlePublishedTime(itemEntity) {
    if (!itemEntity) return undefined;
    if (!itemEntity.meta.firstPublishedAt) return undefined;

    const date = new Date(Date.parse(itemEntity.meta.firstPublishedAt));

    return ogTag(
      'article:published_time',
      `${date.toISOString().split('.')[0]}Z`,
    );
  },

  articlePublisher(itemEntity, entitiesRepo) {
    const { site } = entitiesRepo;

    if (site.globalSeo && site.globalSeo.facebookPageUrl) {
      return ogTag('article:publisher', site.globalSeo.facebookPageUrl);
    }

    return undefined;
  },

  ogLocale(itemEntity, entitiesRepo, i18n) {
    if (i18n.locale.includes('-')) {
      return ogTag('og:locale', i18n.locale.replace(/-/, '_'));
    }

    return ogTag('og:locale', `${i18n.locale}_${i18n.locale.toUpperCase()}`);
  },

  ogType(itemEntity) {
    if (!itemEntity || itemEntity.singleton) {
      return ogTag('og:type', 'website');
    }

    return ogTag('og:type', 'article');
  },

  ogSiteName(itemEntity, entitiesRepo) {
    const { site } = entitiesRepo;

    if (site.globalSeo && site.globalSeo.siteName) {
      return ogTag('og:site_name', site.globalSeo.siteName);
    }

    return undefined;
  },

  image(itemEntity, entitiesRepo, i18n) {
    const itemImage = itemEntity && itemEntity.itemType.fields
      .filter(f => f.fieldType === 'file')
      .map(field => (
        localizedRead(itemEntity, camelize(field.apiKey), field.localized, i18n)
      ))
      .filter(id => !!id)
      .map(id => entitiesRepo.findEntity('upload', id))
      .find(image => (
        image.width && image.height
            && image.width >= 200 && image.height >= 200
      ));

    const itemImageId = itemImage && itemImage.id;

    const imageId = seoAttributeWithFallback(
      'image',
      itemImageId,
      itemEntity,
      entitiesRepo,
      i18n,
    );

    if (imageId) {
      const upload = entitiesRepo.findEntity('upload', imageId);
      const url = buildFileUrl(upload, entitiesRepo);

      return [
        ogTag('og:image', url),
        cardTag('twitter:image', url),
      ];
    }

    return undefined;
  },
};

export default function seoTagsBuilder(itemEntity, entitiesRepo, i18n) {
  return Object.values(builders).reduce((acc, builder) => {
    const result = builder(itemEntity, entitiesRepo, i18n);

    if (result) {
      if (Array.isArray(result)) {
        return [].concat(acc, result);
      }

      return [].concat(acc, [result]);
    }

    return acc;
  }, []);
}
