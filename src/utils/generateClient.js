import 'proxy-polyfill';
import jsonref from 'json-schema-ref-parser';
import pluralize from 'pluralize';
import { decamelize, camelize } from 'humps';
import fetch from './fetch';
import deserializeJsonApi from './deserializeJsonApi';
import serializeJsonApi from './serializeJsonApi';
import RawClient from '../Client';
import fetchAllPages from './fetchAllPages';

const getProps = obj => (
  Object.getOwnPropertyNames(obj)
    .concat(
      Object.getPrototypeOf(obj) !== Object.prototype
        && Object.getOwnPropertyNames(Object.getPrototypeOf(obj)),
    )
    .filter(p => p !== 'constructor')
);

const toMap = keys => keys.reduce((acc, prop) => Object.assign(acc, { [prop]: true }), {});

export default function generateClient(subdomain, cache, extraMethods = {}) {
  return function Client(token, extraHeaders = {}, baseUrl = `https://${subdomain}.datocms.com`) {
    let schemaPromise;

    const rawClient = new RawClient(token, extraHeaders, baseUrl);

    const extraProps = getProps(extraMethods);
    const rawClientProps = getProps(rawClient);

    Object.assign(cache, { rawClient: true }, toMap(extraProps), toMap(rawClientProps));

    const client = new Proxy(cache, {
      get(obj1, namespace) {
        if (namespace === 'rawClient') {
          return rawClient;
        }

        if (rawClientProps.includes(namespace)) {
          return typeof rawClient[namespace] === 'function'
            ? rawClient[namespace].bind(rawClient)
            : rawClient[namespace];
        }

        if (extraProps.includes(namespace)) {
          return typeof extraMethods[namespace] === 'function'
            ? extraMethods[namespace].bind(client, client)
            : extraMethods[namespace];
        }

        return new Proxy(cache[namespace] || {}, {
          get(obj2, apiCall) {
            return function call(...args) {
              if (!schemaPromise) {
                schemaPromise = fetch(`https://${subdomain}.datocms.com/docs/${subdomain}-hyperschema.json`)
                  .then(res => res.json())
                  .then(schema => jsonref.dereference(schema));
              }

              return schemaPromise.then((schema) => {
                const singularized = decamelize(pluralize.singular(namespace));
                const sub = schema.properties[singularized];

                if (!sub) {
                  throw new TypeError(`${namespace} is not a valid namespace`);
                }

                const methodNames = {
                  instances: 'all',
                  self: 'find',
                };

                const identityRegexp = /\{\(.*?definitions%2F(.*?)%2Fdefinitions%2Fidentity\)}/g;

                const link = sub.links.find(
                  l => (methodNames[l.rel] || camelize(l.rel)) === apiCall,
                );

                if (!link) {
                  throw new TypeError(`${namespace}.${apiCall} is not a valid API method`);
                }

                let lastUrlId;

                const url = link.href.replace(identityRegexp, () => {
                  lastUrlId = args.shift();
                  return lastUrlId;
                });

                let bodyOrQueryString = args.shift() || {};
                const options = args.shift() || {};

                const deserializeResponse = Object.prototype.hasOwnProperty.call(options, 'deserializeResponse')
                  ? options.deserializeResponse
                  : true;

                const deserialize = response => (
                  deserializeResponse
                    ? deserializeJsonApi(singularized, link, response)
                    : response
                );

                const serializeRequest = Object.prototype.hasOwnProperty.call(options, 'serializeRequest')
                  ? options.serializeRequest
                  : true;

                if (link.schema && (link.method === 'PUT' || link.method === 'POST') && serializeRequest) {
                  bodyOrQueryString = serializeJsonApi(
                    singularized,
                    bodyOrQueryString,
                    link,
                    link.method === 'PUT' && lastUrlId,
                  );
                }

                if (link.method === 'POST') {
                  return rawClient.post(`${url}`, bodyOrQueryString)
                    .then(response => deserialize(response));
                } if (link.method === 'PUT') {
                  return rawClient.put(`${url}`, bodyOrQueryString)
                    .then(response => deserialize(response));
                } if (link.method === 'DELETE') {
                  return rawClient.delete(url)
                    .then(response => deserialize(response));
                }

                const allPages = Object.prototype.hasOwnProperty.call(options, 'allPages')
                  ? options.allPages
                  : false;

                const request = allPages
                  ? fetchAllPages(rawClient, url, bodyOrQueryString)
                  : rawClient.get(url, bodyOrQueryString);

                return request
                  .then(response => deserialize(response));
              });
            };
          },
        });
      },
    });

    return client;
  };
}
