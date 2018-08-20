/* global destroySiteAndWait:true */

import u from 'updeep';
import { SiteClient, AccountClient } from '../../src/index';

const accountClient = new AccountClient('XXX', null, 'http://account-api.lvh.me:3001');

describe('Site API', () => {
  let site;
  let client;

  beforeEach(vcr('before', async () => {
    site = await accountClient.sites.create({ name: 'Blog' });
    client = new SiteClient(site.readwriteToken, null, 'http://site-api.lvh.me:3001');
  }));

  afterEach(vcr('after', async () => {
    if (site) {
      await destroySiteAndWait(accountClient, site);
    }
  }));

  describe('site', () => {
    it('find, update', vcr(async () => {
      const fetchedSite = await client.site.find();
      expect(fetchedSite.name).to.equal('Blog');

      const updatedSite = await client.site.update(u({ name: 'New blog' }, site));
      expect(updatedSite.name).to.equal('New blog');
    }));
  });

  describe('deploy event', () => {
    it('find, all', vcr(async () => {
      const events = await client.deployEvents.all();
      expect(events).to.have.length(0);
    }));
  });

  describe('menu item', () => {
    it('create, find, all, update, destroy', vcr(async () => {
      const menuItem = await client.menuItems.create({
        label: 'Browse Articles',
        position: 1,
      });
      expect(menuItem.label).to.equal('Browse Articles');

      const foundMenuItems = await client.menuItems.find(menuItem.id);
      expect(foundMenuItems.id).to.equal(menuItem.id);

      const allMenuItems = await client.menuItems.all();
      expect(allMenuItems).to.have.length(1);

      const updatedMenuItems = await client.menuItems.update(
        menuItem.id,
        u({ label: 'Updated' }, menuItem),
      );
      expect(updatedMenuItems.label).to.equal('Updated');

      await client.menuItems.destroy(menuItem.id);
      expect(await client.menuItems.all()).to.have.length(0);
    }));
  });

  describe('item type', () => {
    it('create, find, all, update, destroy', vcr(async () => {
      const itemType = await client.itemTypes.create({
        name: 'Article',
        apiKey: 'item_type',
        singleton: true,
        sortable: false,
        modularBlock: false,
        tree: false,
        orderingDirection: null,
        draftModeActive: false,
        orderingField: null,
        allLocalesRequired: true,
        titleField: null,
      });
      expect(itemType.name).to.equal('Article');

      const foundItemType = await client.itemTypes.find(itemType.id);
      expect(foundItemType.id).to.equal(itemType.id);

      const allItemTypes = await client.itemTypes.all();
      expect(allItemTypes).to.have.length(1);

      const updatedItemType = await client.itemTypes.update(
        itemType.id,
        u({ name: 'UpdatedArticle' }, itemType),
      );
      expect(updatedItemType.name).to.equal('UpdatedArticle');

      await client.itemTypes.destroy(itemType.id);
    }));
  });

  describe('field', () => {
    it('create, find, all, update, destroy', vcr(async () => {
      const itemType = await client.itemTypes.create({
        name: 'Article',
        apiKey: 'item_type',
        singleton: true,
        modularBlock: false,
        tree: false,
        draftModeActive: false,
        sortable: false,
        orderingDirection: null,
        orderingField: null,
        allLocalesRequired: true,
        titleField: null,
      });

      const field = await client.fields.create(
        itemType.id,
        {
          label: 'Image',
          fieldType: 'file',
          localized: false,
          apiKey: 'image',
          hint: '',
          validators: { required: {} },
          appeareance: { editor: 'file', parameters: {} },
          position: 1,
        },
      );
      expect(field.label).to.equal('Image');

      const foundField = await client.fields.find(field.id);
      expect(foundField.id).to.equal(field.id);

      const allFields = await client.fields.all(itemType.id);
      expect(allFields).to.have.length(1);

      const updatedField = await client.fields.update(field.id, { label: 'Updated' });
      expect(updatedField.label).to.equal('Updated');

      await client.fields.destroy(field.id);
    }));
  });

  describe('editors', () => {
    it('create, find, all, destroy', vcr(async () => {
      const roles = await client.roles.all();

      const user = await client.users.create({
        email: 'user.tester@datocms.com',
        firstName: 'user',
        lastName: 'tester',
        role: roles[0].id,
      });

      expect(user.firstName).to.equal('user');

      const foundUser = await client.users.find(user.id);
      expect(foundUser.id).to.equal(user.id);

      const allUsers = await client.users.all();
      expect(allUsers).to.have.length(1);

      await client.users.destroy(foundUser.id);
    }));
  });

  describe('upload request', () => {
    it('create', vcr(async () => {
      const uploadRequest = await client.uploadRequest.create({ filename: 'test.svg' });
      expect(uploadRequest.id).to.not.be.undefined();
    }));
  });

  describe('item', () => {
    it('create, find, all, update, destroy', vcr(async () => {
      const itemType = await client.itemTypes.create({
        name: 'Article',
        apiKey: 'item_type',
        singleton: true,
        modularBlock: false,
        sortable: false,
        tree: false,
        draftModeActive: false,
        orderingDirection: null,
        orderingField: null,
        allLocalesRequired: true,
        titleField: null,
      });

      await client.fields.create(
        itemType.id,
        {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          hint: '',
          validators: { required: {} },
          appeareance: { editor: 'single_line', parameters: { heading: true } },
          position: 1,
        },
      );

      await client.fields.create(
        itemType.id,
        {
          label: 'Attachment',
          fieldType: 'file',
          localized: false,
          apiKey: 'attachment',
          hint: '',
          validators: {
            required: {},
          },
          appeareance: {
            editor: 'file',
            parameters: {},
          },
          position: 2,
        },
      );

      const item = await client.items.create({
        title: 'My first blog post',
        itemType: itemType.id,
        attachment: (await client.uploadFile('test/fixtures/newTextFileHttps.txt')),
      });
      expect(item.title).to.equal('My first blog post');

      const foundItem = await client.items.find(item.id);
      expect(foundItem.id).to.equal(item.id);

      const allItems = await client.items.all();
      expect(allItems).to.have.length(1);

      const updatedItem = await client.items.update(
        item.id,
        u({ title: 'Updated' }, item),
      );
      expect(updatedItem.title).to.equal('Updated');

      await client.items.destroy(item.id);
    }));

    it('creation accepts uncamelized keys', vcr(async () => {
      const itemType = await client.itemTypes.create({
        name: 'Article',
        api_key: 'item_type',
        singleton: true,
        modularBlock: false,
        sortable: false,
        tree: false,
        draftModeActive: false,
        orderingDirection: null,
        orderingField: null,
        allLocalesRequired: true,
        title_field: null,
      });

      await client.fields.create(
        itemType.id,
        {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          hint: '',
          validators: { required: {} },
          appeareance: { editor: 'single_line', parameters: { heading: true } },
          position: 1,
        },
      );

      await client.fields.create(
        itemType.id,
        {
          label: 'Main content',
          field_type: 'text',
          localized: false,
          apiKey: 'main_content',
          hint: '',
          validators: {
            required: {},
          },
          appeareance: {
            editor: 'markdown',
            parameters: {},
          },
          position: 2,
        },
      );

      const item = await client.items.create({
        title: 'My first blog post',
        item_type: itemType.id,
        main_content: 'Foo bar',
      });

      expect(item.mainContent).to.equal('Foo bar');

      await client.items.destroy(item.id);
    }));
  });
});
