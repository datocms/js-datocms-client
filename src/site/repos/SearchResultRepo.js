import deserializeJsonApi from '../../deserializeJsonApi';

export default class SearchResultRepo {
  constructor(client) {
    this.client = client;
  }

  all(query) {
    return this.client.get('/search-results', { q: query })
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }
}
