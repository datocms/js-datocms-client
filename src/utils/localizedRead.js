export default function localizedRead(entity, key, localized, i18n) {
  const hash = entity[key];
  if (localized && hash) {
    const fallbacks = i18n.fallbacks || {};
    const locales = [i18n.locale].concat(fallbacks[i18n.locale] || []);
    const localeWithValue = locales.find(locale => {
      if (hash[locale]) {
        if (Array.isArray(hash[locale])) {
          return hash[locale][0];
        }
        if (typeof hash[locale] === 'object') {
          return Object.keys(hash[locale])[0];
        }
        return hash[locale];
      }

      return undefined;
    });
    return localeWithValue ? hash[localeWithValue] : null;
  }

  return hash;
}
