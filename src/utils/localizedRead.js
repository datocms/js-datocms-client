import i18n from './i18n';

export default function localizedRead(hash) {
  const fallbacks = [i18n.locale].concat(i18n.fallbacks[i18n.locale] || []);
  const localeWithValue = fallbacks.find(locale => hash[locale]);
  return localeWithValue ? hash[localeWithValue] : null;
}
