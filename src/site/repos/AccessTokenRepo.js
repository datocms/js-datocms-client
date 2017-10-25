import deserializeJsonApi from '../../deserializeJsonApi';
import serializeJsonApi from '../../serializeJsonApi';

export default class AccessTokenRepo {
  constructor(client) {
    this.client = client;
  }

  create(resourceAttributes) {
    const serializedResource = serializeJsonApi(
      resourceAttributes,
      {
        type: 'access_token',
        attributes: [
          'name',
        ],
        requiredAttributes: [
          'name',
        ],
        relationships: {
          role: 'role',
        },
      }
    );
    return this.client.post('/access_tokens', serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  update(userId, resourceAttributes) {
    const serializedResource = serializeJsonApi(
      userId,
      resourceAttributes,
      {
        type: 'access_token',
        attributes: [
          'name',
        ],
        relationships: {
          role: 'role',
        },
      }
    );
    return this.client.put(`/access_tokens/${userId}`, serializedResource)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  all() {
    return this.client.get('/access_tokens')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find(userId) {
    return this.client.get(`/access_tokens/${userId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  regenerateToken(userId) {
    return this.client.post(`/access_tokens/${userId}/regenerate_token`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  destroy(userId) {
    return this.client.delete(`/access_tokens/${userId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }
}
