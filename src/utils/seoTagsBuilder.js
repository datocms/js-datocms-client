import { camelize } from 'humps';
import i18n from './i18n';

const tag = (tagName, attributes) => ({ tagName, attributes });
const metaTag = (name, content) => tag('meta', { name, content });
const ogTag = (property, content) => tag('meta', { property, content });
const cardTag = (name, content) => tag('meta', { name, content });
const contentTag = (tagName, content) => ({ tagName, content });

function seoAttributeWithFallback(attribute, alternative, item, site) {
  const fallbackSeo = site.globalSeo && site.globalSeo.fallbackSeo;
  const seoField = item && item.fields.find(f => f.fieldType === 'seo');

  const itemSeoValue = seoField
    && item[camelize(seoField.apiKey)]
    && item[camelize(seoField.apiKey)][attribute];

  const fallbackSeoValue = fallbackSeo && fallbackSeo[attribute];

  return itemSeoValue || alternative || fallbackSeoValue;
}

export const builders = {
  title(item, site) {
    const titleField = item && item.itemType.titleField;

    const title = seoAttributeWithFallback(
      'title',
      titleField && item[camelize(titleField.apiKey)],
      item, site,
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

  description(item, site) {
    const description = seoAttributeWithFallback(
      'description',
      null,
      item, site,
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

  robots(item, site) {
    if (!site.noIndex) return undefined;

    return metaTag('robots', 'noindex');
  },

  twitterSite(item, site) {
    if (site.globalSeo && site.globalSeo.twitterAccount) {
      return cardTag('twitter:site', site.globalSeo.twitterAccount);
    }

    return undefined;
  },

  twitterCard() {
    return cardTag('twitter:card', 'summary');
  },

  articleModifiedTime(item) {
    if (!item) return undefined;
    return ogTag(
      'article:modified_time',
      `${item.updatedAt.toISOString().split('.')[0]}Z`,
    );
  },

  articlePublisher(item, site) {
    if (site.globalSeo && site.globalSeo.facebookPageUrl) {
      return ogTag('article:publisher', site.globalSeo.facebookPageUrl);
    }

    return undefined;
  },

  ogLocale() {
    return ogTag('og:locale', `${i18n.locale}_${i18n.locale.toUpperCase()}`);
  },

  ogType(item) {
    if (!item || item.singleton) {
      return ogTag('og:type', 'website');
    }

    return ogTag('og:type', 'article');
  },

  ogSiteName(item, site) {
    if (site.globalSeo && site.globalSeo.siteName) {
      return ogTag('og:site_name', site.globalSeo.siteName);
    }

    return undefined;
  },

  image(item, site) {
    const itemImage = item && item.fields
      .filter(f => f.fieldType === 'file')
      .map(field => item[camelize(field.apiKey)])
      .filter(image => image)
      .find(image => (
        image.width && image.height
            && image.width >= 200 && image.height >= 200
      ));

    const image = seoAttributeWithFallback('image', itemImage, item, site);

    if (image) {
      const url = image.url();

      return [
        ogTag('og:image', url),
        cardTag('twitter:image', url),
      ];
    }

    return undefined;
  },
};

export default function seoTagsBuilder(item, site) {
  return Object.values(builders).reduce((acc, builder) => {
    const result = builder(item, site);

    if (result) {
      if (Array.isArray(result)) {
        return [].concat(acc, result);
      }

      return [].concat(acc, [result]);
    }

    return acc;
  }, []);
}
