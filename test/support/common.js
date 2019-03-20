/* eslint-disable global-require, no-await-in-loop, no-constant-condition */

import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';

import { AccountClient } from '../../src/index';
import vcr from './vcr';

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


global.generateNewAccountClient = async () => {
  const randomString = Math.random().toString(36).substring(7);

  const anonymousClient = new AccountClient(
    null,
    {},
    'http://account-api.lvh.me:3001',
  );

  const account = await anonymousClient.account.create({
    email: `${randomString}@example.com`,
    password: 'STRONG_pass123!',
    name: 'Test',
    company: 'DatoCMS',
  });

  return new AccountClient(account.id, {}, 'http://account-api.lvh.me:3001');
};

global.vcr = function (...args) {
  const suffix = args.length > 1 ? ` ${args.shift()}` : '';
  const action = args[0];

  return function () {
    let cassetteName = (this.currentTest || this.test).fullTitle();
    if (suffix) { cassetteName += suffix; }

    return vcr(
      slugify(cassetteName),
      {
        afterLoad: (nocks) => {
          nocks.forEach((nock) => {
            if (
              nock.interceptors[0].path === '/account'
              && nock.interceptors[0].method === 'POST'
            ) {
              /* eslint-disable no-param-reassign */
              nock.transformRequestBodyFunction = function (body, aRecordedBody) {
                return aRecordedBody;
              };
            }
          });
        },
      },
      action,
    );
  };
};
