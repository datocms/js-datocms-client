/* global generateNewAccountClient:true */

import SiteClient from '../../src/site/SiteClient';
import uploadFile from '../../src/upload/uploadFile';

describe('Upload file from', async () => {
  let site;
  let client;

  beforeEach(
    vcr('before', async () => {
      const accountClient = await generateNewAccountClient();
      site = await accountClient.sites.create({ name: 'Blog' });
      client = new SiteClient(
        site.readwriteToken,
        null,
        'http://site-api.lvh.me:3001',
      );
    }),
  );

  context('url that responds 200', () => {
    it(
      'uploads file correctly',
      vcr(async () => {
        const uploadData = await uploadFile(
          client,
          'https://www.datocms-assets.com/13095/1561723946-happyfoxbymazack-d8u2l0s-2.jpeg',
        );
        expect(uploadData).to.not.be.null();
        expect(uploadData).to.have.deep.property('alt');
        expect(uploadData).to.have.deep.property('title');

        const upload = await client.uploads.find(uploadData.uploadId);

        expect(upload).to.have.deep.property('copyright');
        expect(upload).to.have.deep.property('notes');
        expect(upload).to.have.deep.property('defaultFieldMetadata');
        expect(upload).to.have.deep.property('tags');
      }),
    );
  });

  context('url that responds 404', () => {
    it(
      'does not upload and returns error',
      vcr(async () => {
        await expect(
          uploadFile(client, 'https://www.datocms.com/we-are-the-robots'),
        ).to.be.rejectedWith(
          'Invalid status code for https://www.datocms.com/we-are-the-robots: 404',
        );
      }),
    );
  });

  context('url (ending with .png) that responds 404', () => {
    it(
      'does not upload and returns error',
      vcr(() => {
        return expect(
          uploadFile(client, 'https://www.datocms.com/we-are-the-robots.png'),
        ).to.be.rejectedWith(
          'Invalid status code for https://www.datocms.com/we-are-the-robots.png: 404',
        );
      }),
    );
  });

  context('url that redirects to image', () => {
    it(
      'follows redirect and uploads file',
      vcr(async () => {
        const uploadData = await uploadFile(
          client,
          'https://httpbin.org/redirect-to?url=https%3A%2F%2Fwww.datocms-assets.com%2F13095%2F1561736871-11-rockingwithlights.png',
        );
        expect(uploadData).to.not.be.null();
      }),
    );
  });

  context('url that contains unescaped characters', () => {
    it(
      'works',
      vcr(async () => {
        const uploadData = await uploadFile(
          client,
          'https://www.ilcaminettodisaliceterme.it/wp-content/uploads/2019/01/menù-estivo.png',
        );
        expect(uploadData).to.not.be.null();
      }),
    );
  });
});
