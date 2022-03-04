import { camelize } from 'humps';
import localizedRead from './localizedRead';
import buildFileUrl from './buildFileUrl';

const tag = (tagName, attributes) => ({ tagName, attributes });
const metaTag = (name, content) => tag('meta', { name, content });
const ogTag = (property, content) => tag('meta', { property, content });
const cardTag = (name, content) => tag('meta', { name, content });
const contentTag = (tagName, content) => ({ tagName, content });

function seoAttributeWithFallback(
  attribute,
  alternative,
  itemEntity,
  entitiesRepo,
  i18n,
) {
  const { site } = entitiesRepo;
  let itemSeoValue;

  const seoField =
    itemEntity && itemEntity.itemType.fields.find(f => f.fieldType === 'seo');

  if (seoField) {
    const itemSeoFieldValue = localizedRead(
      itemEntity,
      camelize(seoField.apiKey),
      seoField.localized,
      i18n,
    );

    itemSeoValue = itemSeoFieldValue && itemSeoFieldValue[attribute];
  }

  const globalSeoValue = localizedRead(
    site,
    'globalSeo',
    site.locales.length > 1,
    i18n,
  );

  const fallbackSeoValue =
    globalSeoValue &&
    globalSeoValue.fallbackSeo &&
    globalSeoValue.fallbackSeo[attribute];

  return itemSeoValue || alternative || fallbackSeoValue;
}

export const builders = {
  title(itemEntity, entitiesRepo, i18n) {
    const { site } = entitiesRepo;
    const itemType = itemEntity && itemEntity.itemType;

    let titleField;

    if (!itemType) {
      titleField = undefined;
    } else if (
      itemType.titleField &&
      itemType.titleField.fieldType !== 'link'
    ) {
      titleField = itemType.titleField;
    } else {
      const fields = itemType.fields.sort((a, b) =>
        a.apiKey.localeCompare(b.apiKey),
      );
      const headingField = fields.find(
        field =>
          field.fieldType === 'string' &&
          field.appearance.editor === 'single_line' &&
          field.appearance.parameters.heading,
      );

      if (headingField) {
        titleField = headingField;
      } else {
        titleField = fields.find(field => field.fieldType === 'string');
      }
    }

    const title = seoAttributeWithFallback(
      'title',
      titleField &&
        localizedRead(
          itemEntity,
          camelize(titleField.apiKey),
          titleField.localized,
          i18n,
        ),
      itemEntity,
      entitiesRepo,
      i18n,
    );

    if (title) {
      const multiLocaleSite = site.locales.length > 1;
      const suffix =
        (localizedRead(site, 'globalSeo', multiLocaleSite, i18n) &&
          localizedRead(site, 'globalSeo', multiLocaleSite, i18n)
            .titleSuffix) ||
        '';

      const titleWithSuffix =
        (title + suffix).length <= 60 ? title + suffix : title;

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
      itemEntity,
      entitiesRepo,
      i18n,
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
      itemEntity,
      entitiesRepo,
      i18n,
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
    const itemType = itemEntity && itemEntity.itemType;

    let itemImageField;

    if (!itemType) {
      itemImageField = undefined;
    } else if (
      itemType.imagePreviewField &&
      itemType.imagePreviewField.fieldType !== 'link'
    ) {
      itemImageField = itemType.imagePreviewField;
    } else {
      itemImageField = itemType.fields
        .sort((a, b) => a.apiKey.localeCompare(b.apiKey))
        .find(field => ['file', 'gallery'].includes(field.fieldType));
    }

    const itemImage =
      itemImageField &&
      localizedRead(
        itemEntity,
        camelize(itemImageField.apiKey),
        itemImageField.localized,
        i18n,
      );

    const fallbackImage =
      itemImage && Array.isArray(itemImage) ? itemImage[0] : itemImage;

    const fallbackImageId = fallbackImage && fallbackImage.uploadId;

    const finalUploadId = seoAttributeWithFallback(
      'image',
      fallbackImageId,
      itemEntity,
      entitiesRepo,
      i18n,
    );

    if (!finalUploadId) {
      return [];
    }

    const upload = entitiesRepo.findEntity('upload', finalUploadId);

    if (!upload.width) {
      return [];
    }

    const url = buildFileUrl(upload, entitiesRepo, {
      w: '1000',
      fit: 'max',
      fm: 'jpg',
    });

    return [ogTag('og:image', url), cardTag('twitter:image', url)];
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
