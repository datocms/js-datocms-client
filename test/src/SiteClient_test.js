import { expect } from 'chai';
/* global generateNewAccountClient:true */

import u from 'updeep';
import b from 'unist-builder';
import unistMap from 'unist-util-map';
import { isBlock } from 'datocms-structured-text-utils';
import { SiteClient, buildModularBlock, ApiException } from '../../src/index';

describe('Site API', () => {
  let site;
  let client;

  beforeEach(
    vcr('before', async () => {
      const accountClient = await generateNewAccountClient();
      site = await accountClient.sites.create({ name: 'Blog' });

      client = new SiteClient(
        site.readwriteToken,
        null,
        process.env.SITE_API_BASE_URL,
      );
    }),
  );

  describe('site', () => {
    it(
      'find, update',
      vcr(async () => {
        const fetchedSite = await client.site.find();
        expect(fetchedSite.name).to.equal('Blog');

        const updatedSite = await client.site.update({ name: 'New blog' });

        expect(updatedSite.name).to.equal('New blog');
      }),
    );
  });

  describe('build events', () => {
    it(
      'find, all',
      vcr(async () => {
        const events = await client.buildEvents.all();
        expect(events).to.have.length(0);
      }),
    );
  });

  describe('menu item', () => {
    it(
      'create, find, all, update, destroy',
      vcr(async () => {
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
      }),
    );
  });

  describe('build triggers', () => {
    it(
      'create, trigger',
      vcr(async () => {
        const trigger = await client.buildTriggers.create({
          accessPolicy: null,
          adapter: 'custom',
          autotriggerOnScheduledPublications: false,
          adapterSettings: { triggerUrl: 'https://www.google.com' },
          frontendUrl: null,
          name: 'Foo',
          indexingEnabled: false,
        });

        await client.buildTriggers.trigger(trigger.id);
      }),
    );
  });

  describe('item type', () => {
    it(
      'create, find, all, update, destroy',
      vcr(async () => {
        const other = await client.itemTypes.create({
          name: 'Other',
          apiKey: 'other',
        });

        await client.itemTypes.update(other.id, u({ name: 'Other 2' }, other));
        await client.itemTypes.destroy(other.id);

        const itemType = await client.itemTypes.create({
          name: 'Article',
          apiKey: 'article',
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

        const field = await client.fields.create(itemType.id, {
          label: 'Title',
          apiKey: 'title',
          fieldType: 'string',
        });

        expect(field.label).to.equal('Title');

        const updatedItemType = await client.itemTypes.update(
          itemType.id,
          u({ name: 'UpdatedArticle', titleField: field.id }, itemType),
        );

        expect(updatedItemType.name).to.equal('UpdatedArticle');
        expect(updatedItemType.titleField).to.equal(field.id);

        await client.itemTypes.destroy(itemType.id);
      }),
    );
  });

  describe('field', () => {
    it(
      'create, find, all, update, destroy',
      vcr(async () => {
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

        const field = await client.fields.create(itemType.id, {
          label: 'Image',
          fieldType: 'file',
          localized: false,
          apiKey: 'image',
          validators: { required: {} },
        });
        expect(field.label).to.equal('Image');

        const foundField = await client.fields.find(field.id);
        expect(foundField.id).to.equal(field.id);

        const allFields = await client.fields.all(itemType.id);
        expect(allFields).to.have.length(1);

        const updatedField = await client.fields.update(field.id, {
          label: 'Updated',
        });
        expect(updatedField.label).to.equal('Updated');

        await client.fields.destroy(field.id);
      }),
    );
  });

  describe('site invitations', () => {
    it(
      'create, find, all, destroy',
      vcr(async () => {
        const roles = await client.roles.all();

        const invitation = await client.siteInvitations.create({
          email: 'user.tester@datocms.com',
          role: roles[0].id,
        });

        const foundInvitation = await client.siteInvitations.find(
          invitation.id,
        );
        expect(foundInvitation.id).to.equal(invitation.id);

        const allInvitations = await client.siteInvitations.all();
        expect(allInvitations).to.have.length(1);

        await client.siteInvitations.destroy(foundInvitation.id);
      }),
    );
  });

  describe('upload request', () => {
    it(
      'create',
      vcr(async () => {
        const uploadRequest = await client.uploadRequest.create({
          filename: 'test.svg',
        });
        expect(uploadRequest.id).to.not.be.undefined();
      }),
    );
  });

  describe('upload', () => {
    it(
      'update',
      vcr(async () => {
        const path = await client.createUploadPath(
          'test/fixtures/newTextFileHttps.txt',
          { filename: 'whoa.txt' },
        );
        const upload = await client.uploads.create({ path });
        expect(upload.path.endsWith('whoa.txt')).to.be.true();
        const updatedUpload = await client.uploads.update(upload.id, {
          author: 'Mark Smith',
        });
        expect(updatedUpload.author).to.equal('Mark Smith');
      }),
    );
  });

  describe('item', () => {
    it(
      'batchDestroy works',
      vcr(async () => {
        const itemType = await client.itemTypes.create({
          name: 'Article',
          apiKey: 'article',
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

        await client.fields.create(itemType.id, {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          validators: {},
        });

        const item = await client.items.create({
          title: 'My first blog post',
          itemType: itemType.id,
        });

        await client.items.batchDestroy({ filter: { ids: item.id } });

        const allItems = await client.items.all();
        expect(allItems).to.have.length(0);
      }),
    );

    it(
      'batch publish/unpublish works',
      vcr(async () => {
        const itemType = await client.itemTypes.create({
          name: 'Article',
          apiKey: 'article',
          singleton: true,
          modularBlock: false,
          sortable: false,
          tree: false,
          draftModeActive: true,
          orderingDirection: null,
          orderingField: null,
          allLocalesRequired: true,
          titleField: null,
        });

        await client.fields.create(itemType.id, {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          validators: {},
        });

        const item = await client.items.create({
          title: 'My first blog post',
          itemType: itemType.id,
        });

        await client.items.batchPublish({ 'filter[ids]': item.id });

        const item1 = await client.items.find(item.id);
        expect(item1.meta.status).to.equal('published');

        await client.items.batchUnpublish({ filter: { ids: item.id } });

        const item2 = await client.items.find(item.id);
        expect(item2.meta.status).to.equal('draft');
      }),
    );

    it(
      'bulk publish/unpublish/destroy works',
      vcr(async () => {
        const itemType = await client.itemTypes.create({
          name: 'Article',
          apiKey: 'article',
          singleton: true,
          modularBlock: false,
          sortable: false,
          tree: false,
          draftModeActive: true,
          orderingDirection: null,
          orderingField: null,
          allLocalesRequired: true,
          titleField: null,
        });

        await client.fields.create(itemType.id, {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          validators: {},
        });

        const item = await client.items.create({
          title: 'My first blog post',
          itemType: itemType.id,
        });

        await client.items.bulkPublish({ items: [item.id] });

        const item1 = await client.items.find(item.id);
        expect(item1.meta.status).to.equal('published');

        await client.items.bulkUnpublish({ items: [item.id] });

        const item2 = await client.items.find(item.id);
        expect(item2.meta.status).to.equal('draft');

        await client.items.bulkDestroy({ items: [item.id] });

        const allItems = await client.items.all();
        expect(allItems).to.have.length(0);
      }),
    );

    it(
      'create, find, all, update, destroy',
      vcr(async () => {
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

        await client.fields.create(itemType.id, {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          validators: { required: {} },
        });

        await client.fields.create(itemType.id, {
          label: 'Attachment',
          fieldType: 'file',
          localized: false,
          apiKey: 'attachment',
          validators: { required: {} },
        });

        const date = '2018-11-24T10:00';

        const item = await client.items.create({
          title: 'My first blog post',
          itemType: itemType.id,
          attachment: await client.uploadFile(
            'test/fixtures/newTextFileHttps.txt',
          ),
          meta: {
            createdAt: date,
            firstPublishedAt: date,
            // updatedAt and publishedAt cannot be edited
            updatedAt: date,
            publishedAt: date,
          },
        });

        expect(item.title).to.equal('My first blog post');
        expect(item.itemType).to.not.be.undefined();
        expect(item.meta.createdAt).to.equal('2018-11-24T10:00:00.000+00:00');
        expect(item.meta.firstPublishedAt).to.equal(
          '2018-11-24T10:00:00.000+00:00',
        );
        expect(item.meta.updatedAt).not.to.equal(
          '2018-11-24T10:00:00.000+00:00',
        );
        expect(item.meta.publishedAt).not.to.equal(
          '2018-11-24T10:00:00.000+00:00',
        );

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

        const updatedItem2 = await client.items.update(item.id, {
          title: 'Updated 2',
        });
        expect(updatedItem2.title).to.equal('Updated 2');

        await client.items.destroy(item.id);
      }),
    );

    it(
      'optimistic locking',
      vcr(async () => {
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

        await client.fields.create(itemType.id, {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          validators: { required: {} },
        });

        const item = await client.items.create({
          title: 'My first blog post',
          itemType: itemType.id,
        });

        const updatedItem = await client.items.update(item.id, {
          title: 'Updated title',
        });

        expect(item.meta.currentVersion).not.to.equal(
          updatedItem.meta.currentVersion,
        );

        return expect(
          client.items.update(item.id, {
            title: 'Stale update title',
            meta: { currentVersion: item.meta.currentVersion },
          }),
        ).to.be.rejectedWith(
          ApiException,
          '422 STALE_ITEM_VERSION (details: {})',
        );
      }),
    );

    it(
      'creation accepts uncamelized keys',
      vcr(async () => {
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

        await client.fields.create(itemType.id, {
          label: 'Title',
          fieldType: 'string',
          localized: false,
          apiKey: 'title',
          validators: { required: {} },
        });

        await client.fields.create(itemType.id, {
          label: 'Main content',
          field_type: 'text',
          localized: false,
          apiKey: 'main_content',
          validators: {
            required: {},
          },
        });

        const item = await client.items.create({
          title: 'My first blog post',
          item_type: itemType.id,
          main_content: 'Foo bar',
        });

        expect(item.mainContent).to.equal('Foo bar');

        await client.items.destroy(item.id);
      }),
    );

    it(
      'modular blocks',
      vcr(async () => {
        const articleItemType = await client.itemTypes.create({
          name: 'Article',
          apiKey: 'article',
        });

        const contentItemType = await client.itemTypes.create({
          name: 'Content',
          apiKey: 'content',
          modularBlock: true,
        });

        await client.fields.create(contentItemType.id, {
          label: 'Text',
          fieldType: 'text',
          apiKey: 'text',
        });

        await client.fields.create(articleItemType.id, {
          label: 'Content',
          fieldType: 'rich_text',
          apiKey: 'content',
          validators: { richTextBlocks: { itemTypes: [contentItemType.id] } },
        });

        const item = await client.items.create({
          itemType: articleItemType.id,
          content: [
            buildModularBlock({ itemType: contentItemType.id, text: 'Foo' }),
            buildModularBlock({ itemType: contentItemType.id, text: 'Bar' }),
          ],
        });

        expect(item.content.length).to.equal(2);

        const itemWithNestedBlocks = await client.items.find(item.id, {
          nested: true,
        });

        await client.items.update(item.id, {
          content: itemWithNestedBlocks.content.map(block => ({
            ...block,
            attributes: {
              ...block.attributes,
              text: `Updated ${block.attributes.text}`,
            },
          })),
        });

        const updatedItemWithNestedBlocks = await client.items.find(item.id, {
          nested: true,
        });

        expect(updatedItemWithNestedBlocks.content[0].attributes.text).to.equal(
          'Updated Foo',
        );
        expect(updatedItemWithNestedBlocks.content[1].attributes.text).to.equal(
          'Updated Bar',
        );
      }),
    );
  });

  it(
    'structured text',
    vcr(async () => {
      const articleItemType = await client.itemTypes.create({
        name: 'Article',
        apiKey: 'article',
      });

      const contentItemType = await client.itemTypes.create({
        name: 'Block',
        apiKey: 'block',
        modularBlock: true,
      });

      await client.fields.create(contentItemType.id, {
        label: 'Text',
        fieldType: 'text',
        apiKey: 'text',
      });

      await client.fields.create(articleItemType.id, {
        label: 'Content',
        fieldType: 'structured_text',
        apiKey: 'content',
        validators: {
          structuredTextBlocks: { itemTypes: [contentItemType.id] },
          structuredTextLinks: { itemTypes: [] },
        },
      });

      const item = await client.items.create({
        itemType: articleItemType.id,
        content: {
          schema: 'dast',
          document: b('root', [
            b('heading', { level: 1 }, [b('span', 'This is the title!')]),
            b('paragraph', [
              b('span', 'And '),
              b('span', { marks: ['strong'] }, 'this'),
              b('span', ' is a paragraph!'),
            ]),
            b('block', {
              item: buildModularBlock({
                itemType: contentItemType.id,
                text: 'Foo',
              }),
            }),
          ]),
        },
      });

      expect(item.content.document.children.length).to.equal(3);

      const itemWithNestedBlocks = await client.items.find(item.id, {
        nested: true,
      });

      await client.items.update(item.id, {
        content: {
          ...itemWithNestedBlocks.content,
          document: unistMap(itemWithNestedBlocks.content.document, node => {
            return isBlock(node)
              ? {
                  ...node,
                  item: {
                    ...node.item,
                    attributes: {
                      ...node.item.attributes,
                      text: `Updated ${node.item.attributes.text}`,
                    },
                  },
                }
              : node;
          }),
        },
      });

      const updatedItemWithNestedBlocks = await client.items.find(item.id, {
        nested: true,
      });

      expect(
        updatedItemWithNestedBlocks.content.document.children[2].item.attributes
          .text,
      ).to.equal('Updated Foo');
    }),
  );

  describe('plugins', () => {
    it(
      'create, find, all, update, destroy',
      vcr(async () => {
        const plugin = await client.plugins.create({
          packageName: 'datocms-plugin-tag-editor',
        });

        await client.plugins.update(plugin.id, {
          parameters: { developmentMode: true },
        });

        await client.plugins.destroy(plugin.id);
      }),
    );
  });

  describe('environments', () => {
    it(
      'all, find, fork, promote, destroy',
      vcr(async () => {
        const primaryEnvironment = await client.environments.find('main');

        const forkedEnvironment = await client.environments.fork(
          primaryEnvironment.id,
          {
            id: 'sandbox-test',
          },
        );

        await client.environments.promote(forkedEnvironment.id);

        await client.environments.promote(primaryEnvironment.id);

        await client.environments.destroy(forkedEnvironment.id);

        const environments = await client.environments.all();
        expect(environments.length).to.equal(1);
      }),
    );
  });
});
