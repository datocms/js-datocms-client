/* eslint-disable no-underscore-dangle */
import {
  decamelize,
  decamelizeLegacyApiKeysWithUnderscoreAndThenNumber,
  camelizeKeys,
} from '../utils/keyFormatter';

export default class JsonApiEntity {
  constructor(payload, repo) {
    const cachedCamelizedAttributes = {};
    let cachedCamelizedMeta = null;

    return new Proxy(
      {
        type: payload.type,
        id: payload.id,
      },
      {
        get: function get(target, prop, receiver) {
          if (prop === 'id') {
            return payload.id;
          }

          if (prop === 'type') {
            return payload.type;
          }

          if (prop === 'payload') {
            return payload;
          }

          if (prop === 'repo') {
            return repo;
          }

          if (prop === 'meta') {
            if (cachedCamelizedMeta) {
              return cachedCamelizedMeta;
            }

            cachedCamelizedMeta = camelizeKeys(payload.meta || {});

            return cachedCamelizedMeta;
          }

          for (const decamelizedProp of [
            decamelize(prop),
            decamelizeLegacyApiKeysWithUnderscoreAndThenNumber(prop),
          ]) {
            if (payload.attributes && decamelizedProp in payload.attributes) {
              if (cachedCamelizedAttributes[prop]) {
                return cachedCamelizedAttributes[prop];
              }

              cachedCamelizedAttributes[prop] = camelizeKeys(
                payload.attributes[decamelizedProp],
              );

              return cachedCamelizedAttributes[prop];
            }

            if (
              payload.relationships &&
              decamelizedProp in payload.relationships
            ) {
              const linkage = payload.relationships[decamelizedProp].data;

              if (Array.isArray(linkage)) {
                return linkage.map(item => repo.findEntity(item.type, item.id));
              }

              if (linkage) {
                return repo.findEntity(linkage.type, linkage.id);
              }

              return null;
            }
          }

          return Reflect.get(target, prop, receiver);
        },
      },
    );
  }
}
