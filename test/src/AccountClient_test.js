import u from 'updeep';
import { AccountClient } from '../../src/index';

const client = new AccountClient('XXX', null, 'http://account-api.lvh.me:3000');

describe('Account API', () => {
  describe('account', () => {
    it('find, update', vcr(async () => {
      let account = await client.account.find();
      expect(account).to.have.property('id');
      account = await client.account.update(
        u({ email: 'foo@bar.com' }, account)
      );
      expect(account.email).to.equal('foo@bar.com');
    }));
  });

  describe('site', () => {
    it('find, all, create, update, destroy, duplicate', vcr(async () => {
      const newSite = await client.sites.create({ name: 'Foobar' });
      expect(newSite.name).to.equal('Foobar');

      await client.sites.update(newSite.id, u({ name: 'Blog' }, newSite));

      const allSites = await client.sites.all();
      expect(allSites).to.have.length(1);

      const site = await client.sites.find(newSite.id);
      expect(site.name).to.equal('Blog');

      const clonedSite = await client.sites.duplicate(newSite.id, { name: 'Another blog' });
      expect(clonedSite.name).to.equal('Another blog');

      await client.sites.destroy(newSite.id);
      await client.sites.destroy(clonedSite.id);

      expect(await client.sites.all()).to.have.length(0);
    }));
  });
});
