/* global generateNewAccountClient:true */

import path from 'path';
import rimraf from 'rimraf';
import tmp from 'tmp';
import fs from 'fs';
import yaml from 'js-yaml';
import TOML from '@iarna/toml';
import parser from 'parser-front-matter';

import dump from '../../src/dump/dump';

import SiteClient from '../../src/site/SiteClient';
import Loader from '../../src/local/Loader';
import ItemsRepo from '../../src/local/ItemsRepo';
import uploadImage from '../../src/upload/uploadImage';

describe('CLI tool', () => {
  it(
    'dump with toml',
    vcr(async () => {
      const accountClient = await generateNewAccountClient();

      const site = await accountClient.sites.create({
        name: 'Integration new test site',
      });

      const client = new SiteClient(
        site.readwriteToken,
        {},
        'http://site-api.lvh.me:3001',
      );

      const dir = tmp.dirSync();
      const dirName = dir.name;

      const configFile = path.resolve('test/fixtures/toml.config.js');
      const loader = new Loader(client, false);
      await loader.load();
      await dump(configFile, new ItemsRepo(loader.entitiesRepo), true, dirName);

      const tomlFile = TOML.parse(
        fs.readFileSync(path.join(dirName, 'foobar.toml'), 'utf8'),
      );

      expect(tomlFile.section[0].key).to.eq('value1');
      expect(tomlFile.section[1].key).to.eq('value2');
      expect(tomlFile.section[2].key).to.eq('value3');
    }),
  );

  it(
    'dump',
    vcr(async () => {
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
        Object.assign(newSite, {
          locales: ['en', 'it'],
          favicon: await uploadImage(client, faviconFilePath).uploadId,
          theme: {
            logo: await uploadImage(client, logoFilePath).uploadId,
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
        }),
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

      const textField = await client.fields.create(itemType.id, {
        apiKey: 'title',
        fieldType: 'string',
        label: 'Title',
        localized: true,
        validators: { required: {} },
      });

      await client.fields.create(itemType.id, {
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
      });

      await client.fields.create(itemType.id, {
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
      });

      await client.fields.create(itemType.id, {
        apiKey: 'video',
        fieldType: 'file',
        label: 'Video',
        localized: false,
        validators: {},
      });

      await client.fields.create(itemType.id, {
        apiKey: 'file',
        fieldType: 'file',
        label: 'File',
        localized: false,
        validators: { required: {} },
      });

      const uploadedFilePath = path.resolve(
        'test/fixtures/uploadable-image.png',
      );

      const imageAttributes = {
        copyright: '2019',
        defaultFieldMetadata: {
          en: {
            title: 'Default title',
            alt: 'Default alt',
            customData: {},
          },
          it: {
            title: null,
            alt: 'Alt default',
            customData: {},
          },
        },
        tags: ['fresh'],
      };

      const image = await client.uploadImage(
        uploadedFilePath,
        imageAttributes,
        {
          alt: 'My post image alt',
          title: null,
        },
      );

      const video = await client.uploadFile(
        'http://techslides.com/demos/sample-videos/small.mp4',
      );

      const file = await client.uploadFile(
        'https://www.datocms.com/robots.txt',
      );

      const item = await client.items.create({
        itemType: itemType.id,
        title: {
          en: 'First post',
          it: 'Primo post',
        },
        slug: 'first-post',
        image,
        video,
        file,
      });

      await client.items.publish(item.id);

      const dir = tmp.dirSync();
      const dirName = dir.name;

      const configFile = path.resolve('test/fixtures/dato.config.js');
      const loader = new Loader(client, false);
      await loader.load();
      await dump(configFile, new ItemsRepo(loader.entitiesRepo), true, dirName);

      const yamlFile = yaml.safeLoad(
        fs.readFileSync(path.join(dirName, 'site.yml'), 'utf8'),
      );
      expect(yamlFile.name).to.eq('Integration new test site');
      expect(yamlFile.locales).to.eql(['en', 'it']);

      const tomlFile = TOML.parse(
        fs.readFileSync(path.join(dirName, 'foobar.toml'), 'utf8'),
      );
      expect(tomlFile.siteName).to.eq('Integration new test site');

      const articleFile = parser.parseSync(
        fs.readFileSync(
          path.join(dirName, 'en', 'posts', 'first-post.md'),
          'utf8',
        ),
      );

      expect(articleFile.data.itemType).to.eq('article');
      expect(articleFile.data.updatedAt).to.not.be.null();
      expect(articleFile.data.createdAt).to.not.be.null();
      expect(articleFile.data.title).to.eq('First post');
      expect(articleFile.data.slug).to.eq('first-post');
      expect(articleFile.data.image.alt).to.eq('My post image alt');
      expect(articleFile.data.image.title).to.eq('Default title');
      expect(articleFile.data.image.format).to.eq('png');
      expect(articleFile.data.image.size).to.eq(22304);
      expect(articleFile.data.image.height).to.eq(398);
      expect(articleFile.data.image.width).to.eq(650);
      expect(articleFile.data.image.copyright).to.eq('2019');
      expect(articleFile.data.image.tags[0]).to.eq('fresh');
      expect(articleFile.data.image.smartTags).to.not.be.null();
      expect(articleFile.data.image.colors[0]).to.deep.equal({
        red: 0,
        green: 255,
        blue: 195,
        rgb: 'rgb(0, 255, 195)',
        alpha: 1,
        hex: '#00ffc3',
      });
      expect(articleFile.data.image.blurhash).to.eq(
        'LlOgNVxuD%t7IUfQofay00ayt7WB',
      );
      expect(articleFile.data.image.url).to.not.be.null();
      // expect(articleFile.data.image.video).to.be.null();
      expect(articleFile.data.video.video).to.have.any.keys(
        'mp4Url',
        'muxPlaybackId',
      );
      expect(articleFile.data.file.format).to.eq('txt');
      expect(articleFile.data.file.size).to.eq(118);
      expect(articleFile.data.file.url).to.not.be.null();

      expect(articleFile.content).to.eq('First post');

      rimraf.sync(path.join(dirName, '*'));
      dir.removeCallback();
    }),
  );
});
