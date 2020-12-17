import {
  camelize as humpsCamelize,
  decamelize as humpsDecamelize,
  camelizeKeys as humpsCamelizeKeys,
  decamelizeKeys as humpsDecamelizeKeys,
} from 'humps';

export function camelize(str) {
  if (/-/.test(str)) {
    return str;
  }

  return humpsCamelize(str);
}

export function decamelize(str) {
  if (str === 'require2fa') {
    return 'require_2fa';
  }

  if (/-/.test(str)) {
    return str;
  }

  return humpsDecamelize(str);
}

export function decamelizeLegacyApiKeysWithUnderscoreAndThenNumber(str) {
  return humpsDecamelize(str).replace(/([0-9]+)/g, '_$1');
}

export function camelizeKeys(payload) {
  return humpsCamelizeKeys(payload, (key, convert, options) => {
    if (/-/.test(key)) {
      return key;
    }

    return convert(key, options);
  });
}

export function decamelizeKeys(payload) {
  return humpsDecamelizeKeys(payload, (key, convert, options) => {
    if (key === 'require2fa') {
      return 'require_2fa';
    }

    if (/-/.test(key)) {
      return key;
    }

    return convert(key, options);
  });
}
