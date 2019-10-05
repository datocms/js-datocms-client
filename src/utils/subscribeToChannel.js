import Pusher from 'pusher-js';

const PUSHER_API_KEY = '75e6ef0fe5d39f481626';

let subscribeToChannelPromise;

module.exports = function subscribeToChannel(client, siteId) {
  if (subscribeToChannelPromise) {
    return subscribeToChannelPromise;
  }

  subscribeToChannelPromise = (siteId
    ? Promise.resolve(siteId)
    : client.site.find().then(site => site.id)
  ).then((realSiteId) => {
    return new Promise((resolve, reject) => {
      const pusher = new Pusher(PUSHER_API_KEY, {
        authEndpoint: `${client.rawClient.baseUrl}/pusher/authenticate`,
        auth: {
          headers: {
            Authorization: `Bearer ${client.rawClient.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      });

      const channel = pusher.subscribe(`private-site-${realSiteId}`);

      channel.bind('pusher:subscription_error', () => {
        reject(new Error('Could not subscribe to real-time events!'));
      });

      channel.bind('pusher:subscription_succeeded', () => {
        resolve([
          channel,
          () => {
            subscribeToChannelPromise = null;
            return pusher.disconnect();
          },
        ]);
      });
    });
  });

  return subscribeToChannelPromise;
};
