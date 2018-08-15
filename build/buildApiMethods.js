const jsonref = require('json-schema-ref-parser');
const fetch = require('isomorphic-fetch');
const pluralize = require('pluralize');
const { camelize } = require('humps');
const fs = require('fs');

const methodNames = {
  instances: 'all',
  self: 'find',
};

function buildCache(subdomain, dir) {
  return fetch(`https://${subdomain}.datocms.com/docs/${subdomain}-hyperschema.json`)
    .then(res => res.json())
    .then(schema => jsonref.dereference(schema))
    .then((schema) => {
      const data = Object.entries(schema.properties).reduce((acc, entry) => {
        const key = entry[0];
        const subschema = entry[1];
        const methods = subschema.links.reduce((acc2, link) => (
          Object.assign(acc2, { [methodNames[link.rel] || camelize(link.rel)]: true })
        ), {});
        const isCollection = Object.keys(methods).includes('all');
        const namespace = isCollection ? pluralize(camelize(key)) : camelize(key);

        if (subschema.links.length > 0) {
          return Object.assign(acc, { [namespace]: methods });
        }

        return acc;
      }, {});

      fs.writeFileSync(`src/${dir}/cache.js`, `/* eslint-disable */\nmodule.exports = ${JSON.stringify(data, null, 2)};`);
    });
}

Promise.all([
  buildCache('site-api', 'site'),
  buildCache('account-api', 'account'),
]);
