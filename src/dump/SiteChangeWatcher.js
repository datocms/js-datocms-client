import Pusher from 'pusher-js/node';

const apiKey = '75e6ef0fe5d39f481626';

export default class SiteChangeWatcher {
  constructor(siteId) {
    this.socket = new Pusher(apiKey);
    this.siteId = siteId;
  }

  connect(cb) {
    this.channel = this.socket.subscribe(`site-${this.siteId}`);
    this.channel.bind('site:change', cb);
  }

  disconnect() {
    this.socket.unsubscribe(`site-${this.siteId}`);
    this.socket.disconnect();
  }
}
