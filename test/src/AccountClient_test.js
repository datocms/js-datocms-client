/* global destroySiteAndWait:true */

import u from 'updeep';
import { AccountClient } from '../../src/index';

const client = new AccountClient('XXX', null, 'http://account-api.lvh.me:3001');

describe('Account API', () => {
  describe('account', () => {
    it('find, update', vcr(async () => {
      let account = await client.account.find();
      expect(account).to.have.property('id');
      account = await client.account.update(
        u({ email: 'prettysurethiswillbeunique@bar.com' }, account),
      );
      expect(account.email).to.equal('prettysurethiswillbeunique@bar.com');
    }));
  });

  describe('site', () => {
    it('find, all, create, update, destroy', vcr(async () => {
      const newSite = await client.sites.create({ name: 'Foobar' });
      expect(newSite.name).to.equal('Foobar');

      await client.sites.update(newSite.id, u({ name: 'Blog' }, newSite));

      const allSites = await client.sites.all();
      expect(allSites).to.have.length(1);

      const site = await client.sites.find(newSite.id);
      expect(site.name).to.equal('Blog');

      await destroySiteAndWait(client, newSite);

      expect(await client.sites.all()).to.have.length(0);
    }));
  });
});
