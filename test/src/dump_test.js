import path from 'path';
import rimraf from 'rimraf';
import tmp from 'tmp';
import dirCompare from 'dir-compare';
import dump from '../../src/dump/dump';
import SiteClient from '../../src/site/SiteClient';
import AccountClient from '../../src/account/AccountClient';
import uploadImage from '../../src/upload/uploadImage';
import uploadFile from '../../src/upload/uploadFile';

describe('CLI tool', () => {
  it('dump', vcr(async () => {
    const accountClient = new AccountClient(
      'XXX',
      {},
      'http://account-api.lvh.me:3001'
    )

    const site = await accountClient.sites.create({
      name: 'Integration new test site'
    });

    const client = new SiteClient(
      site.readwriteToken,
      {},
      'http://site-api.lvh.me:3001'
    );

    const newSite = await client.site.find();

    await client.site.update(
      Object.assign(newSite, { locales: ['en', 'it'] })
    );

    const itemType = await client.itemTypes.create({
      name: 'Article',
      singleton: false,
      modularBlock: false,
      sortable: false,
      tree: false,
      apiKey: 'article',
      orderingDirection: null,
      orderingField: null
    });

    const textField = await client.fields.create(
      itemType.id,
      {
        apiKey: 'title',
        fieldType: 'string',
        appeareance: { type: 'title' },
        label: 'Title',
        localized: true,
        position: 99,
        hint: '',
        validators: { required: {} }
      }
    );

    const slugField = await client.fields.create(
      itemType.id,
      {
        apiKey: 'slug',
        fieldType: 'slug',
        appeareance: {
          titleFieldId: textField.id,
          urlPrefix: null
        },
        label: 'Slug',
        localized: false,
        position: 99,
        hint: '',
        validators: { required: {} }
      }
    );

    const imageField = await client.fields.create(
      itemType.id,
      {
        apiKey: 'image',
        fieldType: 'image',
        appeareance: null,
        label: 'Image',
        localized: false,
        position: 99,
        hint: '',
        validators: { required: {} }
      }
    );

    const fileField = await client.fields.create(
      itemType.id,
      {
        apiKey: 'file',
        fieldType: 'file',
        appeareance: null,
        label: 'File',
        localized: false,
        position: 99,
        hint: '',
        validators: { required: {} }
      }
    );

    const item = await client.items.create({
        itemType: itemType.id,
        title: {
          en: 'First post',
          it: 'Primo post'
        },
        slug: 'first-post',
        image: await uploadImage(client, 'https://www.datocms.com/static/2-00c287793580e47fbe1222a1d44a6e25-95c66.png'),
        file: await uploadFile(client, 'https://www.datocms.com/robots.txt')
    });

    await client.items.publish(item.id);

    const dir = tmp.dirSync();
    const dirName = dir.name;

    // const dirName = path.resolve('test/fixtures/dump');
    const configFile = path.resolve('test/fixtures/dato.config.js');
    await dump(configFile, client, dirName);

    const result = dirCompare.compareSync(
      dirName,
      'test/fixtures/dump',
      { compareContent: true }
    );

    expect(result.differences).to.equal(0);

    rimraf.sync(path.join(dirName, '*'));
    dir.removeCallback();

    await accountClient.sites.destroy(site.id);
  }));
});
