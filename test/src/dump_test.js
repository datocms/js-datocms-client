/* global generateNewAccountClient:true */

import path from 'path';
import rimraf from 'rimraf';
import tmp from 'tmp';
import fs from 'fs';
import yaml from 'js-yaml';
import toml from 'toml';
import parser from 'parser-front-matter';

import dump from '../../src/dump/dump';

import SiteClient from '../../src/site/SiteClient';
import Loader from '../../src/local/Loader';
import ItemsRepo from '../../src/local/ItemsRepo';
import uploadFile from '../../src/upload/uploadFile';
import uploadImage from '../../src/upload/uploadImage';

describe('CLI tool', () => {
  it('dump', vcr(async () => {
    const accountClient = await generateNewAccountClient();

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
        label: 'Title',
        localized: true,
        validators: { required: {} },
      },
    );

    await client.fields.create(
      itemType.id,
      {
        apiKey: 'slug',
        fieldType: 'slug',
        label: 'Slug',
        localized: false,
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
        label: 'Image',
        localized: false,
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
        label: 'File',
        localized: false,
        validators: { required: {} },
      },
    );

    const uploadedFilePath = path.resolve('test/fixtures/uploadable-image.png');

    const item = await client.items.create({
      itemType: itemType.id,
      title: {
        en: 'First post', it: 'Primo post',
      },
      slug: 'first-post',
      file: await uploadFile(client, 'https://www.datocms.com/robots.txt'),
      image: await uploadImage(client, uploadedFilePath),
    });

    await client.items.publish(item.id);

    const dir = tmp.dirSync();
    const dirName = dir.name;

    const configFile = path.resolve('test/fixtures/dato.config.js');
    const loader = new Loader(client, false);
    await loader.load();

    await dump(
      configFile,
      new ItemsRepo(loader.entitiesRepo),
      true,
      dirName,
    );

    const yamlFile = yaml.safeLoad(fs.readFileSync(path.join(dirName, 'site.yml'), 'utf8'));
    expect(yamlFile.name).to.eq('Integration new test site');
    expect(yamlFile.locales).to.eql(['en', 'it']);

    const tomlFile = toml.parse(fs.readFileSync(path.join(dirName, 'foobar.toml'), 'utf8'));
    expect(tomlFile.siteName).to.eq('Integration new test site');

    const articleFile = parser.parseSync(fs.readFileSync(
      path.join(dirName, 'en', 'posts', 'first-post.md'),
      'utf8',
    ));

    expect(articleFile.data.itemType).to.eq('article');
    expect(articleFile.data.updatedAt).to.not.be.null();
    expect(articleFile.data.createdAt).to.not.be.null();
    expect(articleFile.data.title).to.eq('First post');
    expect(articleFile.data.slug).to.eq('first-post');
    expect(articleFile.data.image.format).to.eq('png');
    expect(articleFile.data.image.size).to.eq(22304);
    expect(articleFile.data.image.height).to.eq(398);
    expect(articleFile.data.image.width).to.eq(650);
    expect(articleFile.data.image.url).to.not.be.null();
    expect(articleFile.data.file.format).to.eq('txt');
    expect(articleFile.data.file.size).to.eq(163);
    expect(articleFile.data.file.url).to.not.be.null();

    expect(articleFile.content).to.eq('First post');

    rimraf.sync(path.join(dirName, '*'));
    dir.removeCallback();
  }));
});
