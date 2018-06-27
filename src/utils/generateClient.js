import parser from 'json-schema-ref-parser';
import pluralize from 'pluralize';
import { decamelize } from 'humps';
import fetch from './fetch';
import deserializeJsonApi from './deserializeJsonApi';
import serializeJsonApi from './serializeJsonApi';
import RawClient from '../Client';
import fetchAllPages from './fetchAllPages';

export default function generateClient(subdomain, extraMethods = {}) {
  return function Client(token, extraHeaders = {}, baseUrl = `https://${subdomain}.datocms.com`) {
    let schemaPromise;

    const rawClient = new RawClient(token, extraHeaders, baseUrl);

    const client = new Proxy({}, {
      get(obj1, namespace) {
        if (namespace === 'client') {
          return rawClient;
        }

        if (typeof rawClient[namespace] === 'function') {
          return rawClient[namespace].bind(rawClient);
        }

        if (typeof extraMethods[namespace] === 'function') {
          return extraMethods[namespace].bind(client, client);
        }

        return new Proxy({}, {
          get(obj2, apiCall) {
            return function call(...args) {
              if (!schemaPromise) {
                schemaPromise = fetch(`https://${subdomain}.datocms.com/docs/${subdomain}-hyperschema.json`)
                  .then(res => res.json())
                  .then(schema => parser.dereference(schema));
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
                  l => (methodNames[l.rel] || l.rel) === apiCall
                );

                if (!link) {
                  throw new TypeError(`${namespace}.${apiCall} is not a valid API method`);
                }

                let lastUrlId;

                const url = link.href.replace(identityRegexp, () => {
                  lastUrlId = args.shift();
                  return lastUrlId;
                });

                let body = {};
                if (link.schema && (link.method === 'PUT' || link.method === 'POST')) {
                  const unserializedBody = args.shift();
                  body = serializeJsonApi(
                    singularized,
                    unserializedBody,
                    link,
                    lastUrlId
                  );
                }

                if (link.method === 'POST') {
                  return rawClient.post(`${url}`, body)
                    .then(response => Promise.resolve(deserializeJsonApi(response)));
                } else if (link.method === 'PUT') {
                  return rawClient.put(`${url}`, body)
                    .then(response => Promise.resolve(deserializeJsonApi(response)));
                } else if (link.method === 'DELETE') {
                  return rawClient.delete(url)
                    .then(response => Promise.resolve(deserializeJsonApi(response)));
                }

                const queryString = args.shift();
                const options = args.shift() || {};

                const deserializeResponse = Object.prototype.hasOwnProperty.call(options, 'deserializeResponse') ?
                  options.deserializeResponse :
                  true;

                const allPages = Object.prototype.hasOwnProperty.call(options, 'allPages') ?
                  options.allPages :
                  false;

                const request = allPages ?
                  fetchAllPages(rawClient, url, queryString) :
                  rawClient.get(url, queryString);

                return request
                  .then(response => Promise.resolve(
                    deserializeResponse ?
                      deserializeJsonApi(response) :
                      response
                  ));
              });
            };
          },
        });
      },
    });

    return client;
  };
}
