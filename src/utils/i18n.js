let currentLocale = null;

export default {
  availableLocales: [],

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
};
