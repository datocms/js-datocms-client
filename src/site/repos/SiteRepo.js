import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class SiteRepo {
  constructor(client) {
    this.client = client;
  }

  find() {
    return this.client.get('/site')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'site',
        attributes: [
          'noIndex',
          'favicon',
          'globalSeo',
          'name',
          'themeHue',
          'productionDeployAdapter',
          'productionDeploySettings',
          'stagingDeployAdapter',
          'stagingDeploySettings',
          'locales',
          'timezone',
          'ssg',
          'productionFrontendUrl',
          'stagingFrontendUrl',
          'productionSpiderEnabled',
          'stagingSpiderEnabled',
          'require2fa',
        ],
      }
    );
    return this.client.put('/site', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
