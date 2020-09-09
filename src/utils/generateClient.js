import jsonref from 'json-schema-ref-parser';
import pluralize from 'pluralize';
import { decamelize, camelize } from 'humps';
import fetch from './fetch';
import deserializeJsonApi from './deserializeJsonApi';
import serializeJsonApi from './serializeJsonApi';
import RawClient from '../Client';
import fetchAllPages from './fetchAllPages';
import ApiException from '../ApiException';
import wait from './wait';

const identityRegexp = /\{\(.*?definitions%2F(.*?)%2Fdefinitions%2Fidentity\)}/g;

const getProps = obj =>
  Object.getOwnPropertyNames(obj)
    .concat(
      Object.getPrototypeOf(obj) !== Object.prototype &&
        Object.getOwnPropertyNames(Object.getPrototypeOf(obj)),
    )
    .filter(p => p !== 'constructor');

const toMap = keys =>
  keys.reduce((acc, prop) => Object.assign(acc, { [prop]: true }), {});

const findLinkFor = (schema, namespace, apiCall) => {
  const singularized = decamelize(pluralize.singular(namespace));
  const sub = schema.properties[singularized];

  if (!sub) {
    throw new TypeError(`${namespace} is not a valid namespace`);
  }
  const methodNames = {
    instances: 'all',
    self: 'find',
  };

  const link = sub.links.find(
    l => (methodNames[l.rel] || camelize(l.rel)) === apiCall,
  );

  if (!link) {
    throw new TypeError(`${namespace}.${apiCall} is not a valid API method`);
  }

  return link;
};

export default function generateClient(subdomain, cache, extraMethods = {}) {
  return function Client(
    token,
    extraHeaders = {},
    baseUrl,
  ) {
    let schemaPromise;

    const headers = { ...extraHeaders };

    if (extraHeaders && extraHeaders.environment) {
      headers['X-Environment'] = extraHeaders.environment;
      delete headers.environment;
    }

    const rawClient = new RawClient(token, headers, baseUrl || `https://${subdomain}.datocms.com`);

    const extraProps = getProps(extraMethods);
    const rawClientProps = getProps(rawClient);

    Object.assign(
      cache,
      { rawClient: true },
      toMap(extraProps),
      toMap(rawClientProps),
    );

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
                // FOR DEV
                // `http://${subdomain}.lvh.me:3001/docs/${subdomain}-hyperschema.json`,
                schemaPromise = fetch(
                  `https://${subdomain}.datocms.com/docs/${subdomain}-hyperschema.json`,
                )
                  .then(res => res.json())
                  .then(schema => jsonref.dereference(schema));
              }

              return schemaPromise.then(async schema => {
                const singularized = decamelize(pluralize.singular(namespace));
                const link = findLinkFor(schema, singularized, apiCall);

                let lastUrlId;

                const url = link.href.replace(identityRegexp, () => {
                  lastUrlId = args.shift();
                  return lastUrlId;
                });

                let body = {};

                if (
                  link.schema &&
                  (link.method === 'PUT' || link.method === 'POST')
                ) {
                  body = args.shift() || {};
                }

                const queryString = args.shift() || {};
                const options = args.shift() || {};

                const deserializeResponse = Object.prototype.hasOwnProperty.call(
                  options,
                  'deserializeResponse',
                )
                  ? options.deserializeResponse
                  : true;

                const deserialize = async response => {
                  if (response && response.data.type === 'job') {
                    let jobResult;
                    let retryCount = 0;

                    do {
                      try {
                        retryCount += 1;
                        await wait(retryCount * 1000);
                        jobResult = (
                          await client.jobResult.find(
                            response.data.id,
                            {},
                            { deserializeResponse: false },
                          )
                        ).data;
                      } catch (e) {
                        if (
                          !(e instanceof ApiException) ||
                          e.statusCode !== 404
                        ) {
                          throw e;
                        }
                      }
                    } while (!jobResult);

                    if (
                      jobResult.attributes.status < 200 ||
                      jobResult.attributes.status >= 300
                    ) {
                      throw new ApiException(
                        {
                          status: jobResult.attributes.status,
                          statusText: jobResult.attributes.statusText,
                        },
                        jobResult.attributes.payload,
                      );
                    }

                    return deserializeResponse
                      ? deserializeJsonApi(
                          singularized,
                          link.jobSchema,
                          jobResult.attributes.payload,
                        )
                      : jobResult.attributes.payload;
                  }

                  return deserializeResponse
                    ? deserializeJsonApi(
                        singularized,
                        link.targetSchema,
                        response,
                      )
                    : response;
                };

                const serializeRequest = Object.prototype.hasOwnProperty.call(
                  options,
                  'serializeRequest',
                )
                  ? options.serializeRequest
                  : true;

                if (
                  link.schema &&
                  (link.method === 'PUT' || link.method === 'POST') &&
                  serializeRequest
                ) {
                  body = serializeJsonApi(
                    body,
                    link,
                    link.method === 'PUT' && lastUrlId,
                  );
                }

                if (link.method === 'POST') {
                  return rawClient
                    .post(`${url}`, body, queryString)
                    .then(response => deserialize(response));
                }
                if (link.method === 'PUT') {
                  return rawClient
                    .put(`${url}`, body, queryString)
                    .then(response => deserialize(response));
                }
                if (link.method === 'DELETE') {
                  return rawClient
                    .delete(url, queryString)
                    .then(response => deserialize(response));
                }

                const allPages = Object.prototype.hasOwnProperty.call(
                  options,
                  'allPages',
                )
                  ? options.allPages
                  : false;

                const request = allPages
                  ? fetchAllPages(rawClient, url, queryString)
                  : rawClient.get(url, queryString);

                return request.then(response => deserialize(response));
              });
            };
          },
        });
      },
    });

    return client;
  };
}
