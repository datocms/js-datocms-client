import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class AccountRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'account',
        attributes: [
          'email',
          'password',
        ],
        requiredAttributes: [
          'email',
          'password',
        ],
      }
    );
    return this.client.post('/account', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'account',
        attributes: [
          'email',
          'password',
        ],
      }
    );
    return this.client.put('/account', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find() {
    return this.client.get('/account')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  resetPassword(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'account',
        attributes: [
          'email',
        ],
        requiredAttributes: [
          'email',
        ],
      }
    );
    return this.client.post('/account/reset_password', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
