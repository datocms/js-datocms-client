/* eslint-disable global-require, no-await-in-loop, no-constant-condition */

import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import vcr from 'nock-vcr-recorder';

chai.use(dirtyChai);

global.expect = expect;
global.memo = function memo(fn) {
  let value;

  return function () {
    value = value || fn();
    return value;
  };
};

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

global.vcr = function (...args) {
  const suffix = args.length > 1 ? ` ${args.shift()}` : '';
  const action = args[0];

  return function () {
    let cassetteName = (this.currentTest || this.test).fullTitle();
    if (suffix) { cassetteName += suffix; }

    return vcr.useCassette('json-api-doc', () => {
      require('../../src/index');
    }).then(() => {
      return vcr.useCassette(slugify(cassetteName), action);
    });
  };
};

global.destroySiteAndWait = async function (client, site) {
  await client.sites.destroy(site.id);

  while (true) {
    try {
      await client.sites.find(site.id);
      // await wait(3000);
    } catch (e) {
      break;
    }
  }
};
