import 'core-js/fn/object/entries';
import 'core-js/fn/object/values';

if (process.env.ADD_POLYFILLS) {
  /* eslint-disable global-require */
  require('babel-polyfill');
  require('whatwg-fetch');
  /* eslint-enable global-require */
}

export { default as AccountClient } from './account/AccountClient';
export { default as SiteClient } from './site/SiteClient';
export { default as Loader } from './local/Loader';
export { default as Image } from './local/fields/Image';
export { default as File } from './local/fields/Image';
export { default as Seo } from './local/fields/Seo';
