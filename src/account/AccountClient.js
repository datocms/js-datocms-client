import * as repos from './repos';
import Client from '../Client';

export default class AccountClient extends Client {
  constructor(token, extraHeaders, baseUrl = 'https://account-api.datocms.com') {
    super(token, extraHeaders, baseUrl);

    const repoInstances = [];

    for (const [method, Klass] of Object.entries(repos)) {
      Object.defineProperty(
        this,
        method,
        {
          enumerable: true,
          get() {
            repoInstances[method] = repoInstances[method] || new Klass(this);
            return repoInstances[method];
          },
        }
      );
    }
  }
}
