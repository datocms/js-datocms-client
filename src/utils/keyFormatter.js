import {
  camelize as humpsCamelize,
  camelizeKeys as humpsCamelizeKeys,
  decamelizeKeys as humpsDecamelizeKeys,
} from 'humps';

export function camelize(str) {
  if (/-/.test(str)) {
    return str;
  }

  return humpsCamelize(str);
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
