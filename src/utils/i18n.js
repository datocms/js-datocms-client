let currentLocale = 'en';

export default {
  availableLocales: ['en'],
  fallbacks: {},

  get locale() {
    return currentLocale;
  },

  set locale(value) {
    if (this.availableLocales.includes(value)) {
      currentLocale = value;
    } else {
      throw new Error(`Invalid locale ${value}`);
    }
  },

  withLocale(locale, fn) {
    const oldLocale = currentLocale;
    this.locale = locale;
    const result = fn();
    this.locale = oldLocale;
    return result;
  },
};
