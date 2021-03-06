/* eslint-disable global-require, no-await-in-loop, no-constant-condition */

import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';

import { AccountClient } from '../../src/index';
import vcr from './vcr';

chai.use(dirtyChai);
chai.use(chaiAsPromised);

global.expect = expect;

global.memo = function memo(fn) {
  let value;

  return function() {
    value = value || fn();
    return value;
  };
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

global.generateNewAccountClient = async () => {
  const randomString = Math.random()
    .toString(36)
    .substring(7);

  const anonymousClient = new AccountClient(
    null,
    {},
    process.env.ACCOUNT_API_BASE_URL,
  );

  // @delete-this-at-midnight-utc.tk accounts are deleted
  // everyday at 00:00:00UTC

  const account = await anonymousClient.account.create({
    email: `${randomString}@delete-this-at-midnight-utc.tk`,
    password: 'STRONG_pass123!',
    name: 'Test',
    company: 'DatoCMS',
  });

  return new AccountClient(account.id, {}, process.env.ACCOUNT_API_BASE_URL);
};

global.vcr = function(...args) {
  const suffix = args.length > 1 ? ` ${args.shift()}` : '';
  const action = args[0];

  return function() {
    let cassetteName = (this.currentTest || this.test).fullTitle();
    if (suffix) {
      cassetteName += suffix;
    }

    return vcr(
      slugify(cassetteName),
      {
        afterLoad: nocks => {
          nocks.forEach(nock => {
            if (
              nock.interceptors[0].path === '/account' &&
              nock.interceptors[0].method === 'POST'
            ) {
              /* eslint-disable no-param-reassign */
              nock.transformRequestBodyFunction = function(
                body,
                aRecordedBody,
              ) {
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
