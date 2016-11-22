import deserializeJsonApi from '../../deserializeJsonApi';

export default class DeployEventRepo {
  constructor(client) {
    this.client = client;
  }

  all() {
    return this.client.get('/deploy-events')
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

  find(deployEventId) {
    return this.client.get(`/deploy-events/${deployEventId}`)
    .then(response => Promise.resolve(deserializeJsonApi(response)));
  }

}
