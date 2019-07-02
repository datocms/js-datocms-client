/* global generateNewAccountClient:true */

import u from 'updeep';
import { SiteClient } from '../../src/index';

describe('Site API', () => {
  let site;
  let client;

  beforeEach(vcr('before', async () => {
    const accountClient = await generateNewAccountClient();
    site = await accountClient.sites.create({ name: 'Blog' });
    client = new SiteClient(site.readwriteToken, null, 'http://site-api.lvh.me:3001');
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

  describe('deployment environment', () => {
    it('create, trigger', vcr(async () => {
      const env = await client.deploymentEnvironments.create({
        accessPolicy: null,
        deployAdapter: 'custom',
        buildOnScheduledPublications: false,
        deploySettings: { triggerUrl: 'https://www.google.com' },
        frontendUrl: null,
        name: 'Foo',
        spiderEnabled: false,
      });

      await client.deploymentEnvironments.trigger(env.id);
    }));
  });

  describe('item type', () => {
    it('create, find, all, update, destroy', vcr(async () => {
      const other = await client.itemTypes.create({
        name: 'Other',
        apiKey: 'other',
      });

      await client.itemTypes.update(
        other.id,
        u({ name: 'Other 2' }, other),
      );

      await client.itemTypes.destroy(other.id);

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
          validators: { required: {} },
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

  describe('site invitations', () => {
    it('create, find, all, destroy', vcr(async () => {
      const roles = await client.roles.all();

      const invitation = await client.siteInvitations.create({
        email: 'user.tester@datocms.com',
        role: roles[0].id,
      });

      const foundInvitation = await client.siteInvitations.find(invitation.id);
      expect(foundInvitation.id).to.equal(invitation.id);

      const allInvitations = await client.siteInvitations.all();
      expect(allInvitations).to.have.length(1);

      await client.siteInvitations.destroy(foundInvitation.id);
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
          validators: { required: {} },
        },
      );

      await client.fields.create(
        itemType.id,
        {
          label: 'Attachment',
          fieldType: 'file',
          localized: false,
          apiKey: 'attachment',
          validators: {
            required: {},
          },
        },
      );

      const item = await client.items.create({
        title: 'My first blog post',
        itemType: itemType.id,
        attachment: (await client.uploadFile('test/fixtures/newTextFileHttps.txt')),
      });
      expect(item.title).to.equal('My first blog post');
      expect(item.itemType).to.not.be.undefined();

      const foundItem = await client.items.find(item.id);
      expect(foundItem.id).to.equal(item.id);
      expect(foundItem.itemType).to.not.be.undefined();

      const allItems = await client.items.all();
      expect(allItems).to.have.length(1);
      expect(allItems[0].itemType).to.not.be.undefined();

      const updatedItem = await client.items.update(
        item.id,
        u({ title: 'Updated' }, item),
      );
      expect(updatedItem.title).to.equal('Updated');

      const updatedItem2 = await client.items.update(
        item.id,
        { title: 'Updated 2' },
      );
      expect(updatedItem2.title).to.equal('Updated 2');

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
          validators: { required: {} },
        },
      );

      await client.fields.create(
        itemType.id,
        {
          label: 'Main content',
          field_type: 'text',
          localized: false,
          apiKey: 'main_content',
          validators: {
            required: {},
          },
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

  describe('plugins', () => {
    it('create, find, all, update, destroy', vcr(async () => {
      const plugin = await client.plugins.create({
        packageName: 'datocms-plugin-tag-editor',
      });

      await client.plugins.update(
        plugin.id,
        { parameters: { developmentMode: true } },
      );

      await client.plugins.destroy(plugin.id);
    }));
  });
});
