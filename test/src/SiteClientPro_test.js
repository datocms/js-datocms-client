import { expect } from 'chai';
/* global generateNewAccountClient:true */

import { SiteClient } from '../../src/index';

const shouldRunTest = () => {
  // This test is only available in developmentMode
  // To make it pass change the CHARGEBEE_BASE_PLAN_ID to 210 in the API .env

  if (
    process.env.ACCOUNT_API_BASE_URL !== 'http://account-api.lvh.me:3001' ||
    process.env.SITE_API_BASE_URL !== 'http://site-api.lvh.me:3001'
  ) {
    console.log(
      'Pro plans test skipped. To enable it, run `npm run dev:test` and change CHARGEBEE_BASE_PLAN_ID in the API .env and ',
    );

    return false;
  }

  return true;
};

(shouldRunTest() ? describe : describe.skip)('Site API Pro plan', () => {
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

  describe('sso settings', () => {
    it(
      'find, generateToken, update',
      vcr(async () => {
        const ssoSettings = await client.ssoSettings.find();

        expect(ssoSettings).not.to.equal(null);

        const { scimApiToken } = await client.ssoSettings.generateToken();

        expect(scimApiToken).not.to.equal(ssoSettings.scimApiToken);

        const updatedSsoSettings = await client.ssoSettings.update({
          defaultRole: null,
          idpSamlMetadataUrl:
            'https://my-org.oktapreview.com/app/XXXX/sso/saml/metadata',
        });

        expect(updatedSsoSettings.idpSamlMetadataUrl).to.equal(
          'https://my-org.oktapreview.com/app/XXXX/sso/saml/metadata',
        );
      }),
    );
  });

  describe('white label settings', () => {
    it(
      'find, update',
      vcr(async () => {
        const whiteLabelSettings = await client.whiteLabelSettings.update({
          customI18nMessagesTemplateUrl:
            'https://my-app-messages.netlify.app/:locale/message.json',
        });

        expect(whiteLabelSettings.customI18nMessagesTemplateUrl).to.equal(
          'https://my-app-messages.netlify.app/:locale/message.json',
        );

        const whiteLabel = await client.whiteLabelSettings.find();

        expect(whiteLabel).not.to.equal(null);
        expect(whiteLabel.customI18nMessagesTemplateUrl).to.equal(
          'https://my-app-messages.netlify.app/:locale/message.json',
        );
      }),
    );
  });
});
