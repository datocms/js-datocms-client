import { camelize } from 'humps';
import striptags from 'striptags';
import { render } from 'datocms-structured-text-to-plain-text';
import { marked } from 'marked';
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

    const findTitleField = () => {
      const itemType = itemEntity && itemEntity.itemType;

      if (!itemType) {
        return undefined;
      }

      if (itemType.titleField && itemType.titleField.fieldType !== 'link') {
        return itemType.titleField;
      }

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
        return headingField;
      }
      return fields.find(field => field.fieldType === 'string');
    };

    const titleField = findTitleField();

    const itemTitle = seoAttributeWithFallback(
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

    if (!itemTitle) {
      return undefined;
    }

    const globalSeoValue = localizedRead(
      site,
      'globalSeo',
      site.locales.length > 1,
      i18n,
    );
    const suffix = (globalSeoValue && globalSeoValue.titleSuffix) || '';
    const titleWithSuffix =
      (itemTitle + suffix).length <= 60 ? itemTitle + suffix : itemTitle;

    return [
      contentTag('title', titleWithSuffix),
      ogTag('og:title', itemTitle),
      cardTag('twitter:title', itemTitle),
    ];
  },

  description(itemEntity, entitiesRepo, i18n) {
    const itemType = itemEntity && itemEntity.itemType;
    const excerptField = itemType && itemType.excerptField;

    const findExcerptValue = () => {
      const value = localizedRead(
        itemEntity,
        camelize(excerptField.apiKey),
        excerptField.localized,
        i18n,
      );

      const transformExcerptValue = () => {
        switch (excerptField.fieldType) {
          case 'text':
            if (excerptField.appearance.editor === 'wysiwyg') {
              return striptags(value);
            }
            if (excerptField.appearance.editor === 'markdown') {
              return striptags(marked.parse(value).replace('\n', ''));
            }
            return value;
          case 'structured_text':
            return render(value);
          case 'string':
            return value;
          default:
            return undefined;
        }
      };

      const postTransformationValue = value && transformExcerptValue();

      return postTransformationValue && postTransformationValue.length > 200
        ? `${postTransformationValue.slice(0, 200)}...`
        : postTransformationValue;
    };

    const excerptValue = excerptField && findExcerptValue();

    const description = seoAttributeWithFallback(
      'description',
      excerptValue,
      itemEntity,
      entitiesRepo,
      i18n,
    );

    if (!description) {
      return undefined;
    }

    return [
      metaTag('description', description),
      ogTag('og:description', description),
      cardTag('twitter:description', description),
    ];
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
    const { site } = entitiesRepo;

    const findImagePreviewField = () => {
      const itemType = itemEntity && itemEntity.itemType;

      if (!itemType) {
        return undefined;
      }

      if (
        itemType.imagePreviewField &&
        itemType.imagePreviewField.fieldType !== 'link'
      ) {
        return itemType.imagePreviewField;
      }

      const fields = itemType.fields.sort((a, b) =>
        a.apiKey.localeCompare(b.apiKey),
      );

      const fileFieldWithImageValidations = fields.find(
        field =>
          ['file', 'gallery'].includes(field.fieldType) &&
          field.validators &&
          field.validators.extension &&
          field.validators.extension.predefinedList === 'image',
      );

      return (
        fileFieldWithImageValidations ||
        fields.find(field => ['file', 'gallery'].includes(field.fieldType))
      );
    };

    const itemImageField = findImagePreviewField();

    const fallbackRawValue =
      itemImageField &&
      localizedRead(
        itemEntity,
        camelize(itemImageField.apiKey),
        itemImageField.localized,
        i18n,
      );

    const fallbackImage =
      fallbackRawValue && Array.isArray(fallbackRawValue)
        ? fallbackRawValue[0]
        : fallbackRawValue;

    const fallbackImageId = fallbackImage && fallbackImage.uploadId;

    const finalUploadId = seoAttributeWithFallback(
      'image',
      fallbackImageId,
      itemEntity,
      entitiesRepo,
      i18n,
    );

    if (!finalUploadId) {
      return undefined;
    }

    const finalUpload = entitiesRepo.findEntity('upload', finalUploadId);

    if (!finalUpload.width) {
      return undefined;
    }

    const url = buildFileUrl(finalUpload, entitiesRepo, {
      w: '1000',
      fit: 'max',
      fm: 'jpg',
    });

    const { defaultFieldMetadata } = finalUpload;

    const altLocale = defaultFieldMetadata
      ? site.locales.find(
          locale =>
            defaultFieldMetadata[locale] && defaultFieldMetadata[locale].alt,
        )
      : site.locales[0];

    const altValue =
      defaultFieldMetadata &&
      defaultFieldMetadata[altLocale] &&
      defaultFieldMetadata[altLocale].alt;

    return [
      ogTag('og:image', url),
      cardTag('twitter:image', url),
      ogTag('og:image:width', finalUpload.width),
      ogTag('og:image:height', finalUpload.height),
      altValue && ogTag('og:image:alt', altValue),
      altValue && ogTag('twitter:image:alt', altValue),
    ].filter(x => !!x);
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
