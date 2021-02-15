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
        process.env.SITE_API_BASE_URL,
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

    it(
      'communicates progress',
      vcr(async () => {
        const startTime = Date.now();
        let lastProgressTimestamp = startTime;
        await uploadFile(
          client,
          'https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA17005.jpg',
          {},
          {},
          {
            onProgress: ({ type }) => {
              if (type === 'upload') {
                lastProgressTimestamp = Date.now();
              }
            },
          },
        );

        expect(lastProgressTimestamp - startTime).to.be.above(0);
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
        const uploadData = await uploadFile(client, 'https://bit.ly/2ZeLedM');
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

  context('remote upload cancellation', () => {
    it(
      'can be cancelled',
      vcr(async () => {
        let noProgress = true;
        const promise = uploadFile(
          client,
          'https://www.datocms-assets.com/13095/1561723946-happyfoxbymazack-d8u2l0s-2.jpeg',
          {},
          {},
          {
            onProgress: () => {
              noProgress = false;
            },
          },
        );
        promise.cancel();
        await expect(promise).to.be.rejectedWith('aborted');
        expect(noProgress).to.be.true();
      }),
    );

    it(
      'can be cancelled during download',
      vcr(async () => {
        let noUpload = true;
        let cancel = () => {};
        const promise = uploadFile(
          client,
          'https://www.datocms-assets.com/13095/1561723946-happyfoxbymazack-d8u2l0s-2.jpeg',
          {},
          {},
          {
            onProgress: ({ type, payload }) => {
              noUpload = type !== 'upload';
              if (type === 'download' && payload.percent > 2) {
                cancel();
              }
            },
          },
        );
        cancel = promise.cancel;
        await expect(promise).to.be.rejectedWith('aborted');
        expect(noUpload).to.be.true();
      }),
    );

    it(
      'can be cancelled during upload',
      vcr(async () => {
        let noUpload = true;
        let cancel = () => {};
        const promise = uploadFile(
          client,
          'https://www.datocms-assets.com/13095/1561723946-happyfoxbymazack-d8u2l0s-2.jpeg',
          {},
          {},
          {
            onProgress: ({ type, payload }) => {
              if (type === 'upload') {
                if (payload.percent > 5) {
                  cancel();
                } else {
                  noUpload = payload.percent <= 5;
                }
              }
            },
          },
        );
        cancel = promise.cancel;
        await expect(promise).to.be.rejectedWith('aborted');
        expect(noUpload).to.be.true();
      }),
    );
  });

  context('renaming file', () => {
    it(
      'works',
      vcr(async () => {
        const uploadData = await uploadFile(
          client,
          'https://www.datocms-assets.com/13095/1561723946-happyfoxbymazack-d8u2l0s-2.jpeg',
          {},
          {},
          { filename: 'test.jpeg' },
        );

        const upload = await client.uploads.find(uploadData.uploadId);

        expect(upload.basename).to.equal('test');
        expect(upload.filename).to.equal('test.jpeg');
        expect(upload.url).to.match(/-test.jpeg$/);
      }),
    );
  });
});
