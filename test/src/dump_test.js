/* global destroySiteAndWait:true */

import path from 'path';
import rimraf from 'rimraf';
import tmp from 'tmp';
import dirCompare from 'dir-compare';
import dump from '../../src/dump/dump';
import SiteClient from '../../src/site/SiteClient';
import AccountClient from '../../src/account/AccountClient';
import uploadFile from '../../src/upload/uploadFile';
import uploadImage from '../../src/upload/uploadImage';

describe('CLI tool', () => {
  it('dump', vcr(async () => {
    const accountClient = new AccountClient(
      'XXX',
      {},
      'http://account-api.lvh.me:3001',
    );

    const site = await accountClient.sites.create({
      name: 'Integration new test site',
    });

    const client = new SiteClient(
      site.readwriteToken,
      {},
      'http://site-api.lvh.me:3001',
    );

    const newSite = await client.site.find();
    const faviconFilePath = path.resolve('test/fixtures/favicon.ico');
    const logoFilePath = path.resolve('test/fixtures/dato-logo.jpg');

    await client.site.update(
      Object.assign(
        newSite,
        {
          locales: ['en', 'it'],
          favicon: await uploadImage(client, faviconFilePath),
          theme: {
            logo: await uploadImage(client, logoFilePath),
            primaryColor: {
              red: 127,
              green: 127,
              blue: 127,
              alpha: 127,
            },
            lightColor: {
              red: 63,
              green: 63,
              blue: 63,
              alpha: 63,
            },
            darkColor: {
              red: 0,
              green: 0,
              blue: 0,
              alpha: 0,
            },
            accentColor: {
              red: 255,
              green: 255,
              blue: 255,
              alpha: 255,
            },
          },
        },
      ),
    );

    const itemType = await client.itemTypes.create({
      name: 'Article',
      singleton: false,
      modularBlock: false,
      sortable: false,
      tree: false,
      apiKey: 'article',
      orderingDirection: null,
      orderingField: null,
      draftModeActive: false,
      allLocalesRequired: false,
      titleField: null,
    });

    const textField = await client.fields.create(
      itemType.id,
      {
        apiKey: 'title',
        fieldType: 'string',
        appeareance: { editor: 'single_line', parameters: { heading: true } },
        label: 'Title',
        localized: true,
        position: 99,
        hint: '',
        validators: { required: {} },
      },
    );

    await client.fields.create(
      itemType.id,
      {
        apiKey: 'slug',
        fieldType: 'slug',
        appeareance: {
          editor: 'slug',
          parameters: {
            urlPrefix: null,
          },
        },
        label: 'Slug',
        localized: false,
        position: 99,
        hint: '',
        validators: {
          required: {},
          slugTitleField: {
            titleFieldId: textField.id,
          },
        },
      },
    );

    await client.fields.create(
      itemType.id,
      {
        apiKey: 'image',
        fieldType: 'file',
        appeareance: {
          editor: 'file',
          parameters: {},
        },
        label: 'Image',
        localized: false,
        position: 99,
        hint: '',
        validators: {
          required: {},
          extension: {
            predefined_list: 'image',
          },
        },
      },
    );

    await client.fields.create(
      itemType.id,
      {
        apiKey: 'file',
        fieldType: 'file',
        appeareance: {
          editor: 'file',
          parameters: {},
        },
        label: 'File',
        localized: false,
        position: 99,
        hint: '',
        validators: { required: {} },
      },
    );

    const uploadedFilePath = path.resolve('test/fixtures/uploadable-image.png');

    const item = await client.items.create({
      itemType: itemType.id,
      title: {
        en: 'First post',
        it: 'Primo post',
      },
      slug: 'first-post',
      file: await uploadFile(client, 'https://www.datocms.com/robots.txt'),
      image: await uploadImage(client, uploadedFilePath),
    });

    await client.items.publish(item.id);

    const dir = tmp.dirSync();

    // const dirName = dir.name;
    // FOR DEV
    const dirName = path.resolve('test/fixtures/dump');

    const configFile = path.resolve('test/fixtures/dato.config.js');

    await dump(configFile, client, true, dirName);

    const result = dirCompare.compareSync(
      dirName,
      'test/fixtures/dump',
      { compareContent: true },
    );

    expect(result.differences).to.equal(0);

    rimraf.sync(path.join(dirName, '*'));
    dir.removeCallback();

    await destroySiteAndWait(accountClient, site);
  }));
});
