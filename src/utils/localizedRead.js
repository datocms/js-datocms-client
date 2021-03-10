export default function localizedRead(entity, key, localized, i18n) {
  const hash = entity[key];
  if (localized && hash) {
    const fallbacks = i18n.fallbacks || {};
    const locales = [i18n.locale].concat(fallbacks[i18n.locale] || []);
    const localeWithValue = locales.find(locale => {
      const localeValue = hash[locale];
      if (localeValue !== null && localeValue !== undefined) {
        if (Array.isArray(localeValue)) {
          return localeValue[0];
        }
        if (typeof localeValue === 'object') {
          return Object.keys(localeValue)[0];
        }
        return localeValue;
      }

      return undefined;
    });
    return localeWithValue ? hash[localeWithValue] : null;
  }

  return hash;
}
