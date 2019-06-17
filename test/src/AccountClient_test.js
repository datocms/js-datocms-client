/* global generateNewAccountClient:true */

import u from 'updeep';

describe('Account API', () => {
  describe('account', () => {
    it('find, update', vcr(async () => {
      const client = await generateNewAccountClient();

      let account = await client.account.find();

      expect(account).to.have.property('id');

      account = await client.account.update(
        u({ company: 'Dundler Mifflin' }, account),
      );

      account = await client.account.find();
      expect(account.company).to.equal('Dundler Mifflin');
    }));
  });

  describe('site', () => {
    it('find, all, create, update, destroy', vcr(async () => {
      const client = await generateNewAccountClient();

      const newSite = await client.sites.create({ name: 'Foobar' });
      expect(newSite.name).to.equal('Foobar');

      await client.sites.update(newSite.id, u({ name: 'Blog' }, newSite));

      const allSites = await client.sites.all();
      expect(allSites).to.have.length(1);

      const site = await client.sites.find(newSite.id);
      expect(site.name).to.equal('Blog');
    }));
  });
});
