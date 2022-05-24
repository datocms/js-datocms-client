import Pusher from 'pusher-js';

const PUSHER_API_KEY = '75e6ef0fe5d39f481626';

const channels = {};

export default function subscribeToChannel(client, siteId, environment) {
  const cacheKey = `${siteId}--${environment || 'primary'}`;

  const cachedPromise = channels[cacheKey];

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = (siteId
    ? Promise.resolve(siteId)
    : client.site.find().then(site => site.id)
  ).then(realSiteId => {
    return new Promise((resolve, reject) => {
      const pusher = new Pusher(PUSHER_API_KEY, {
        authEndpoint: `${client.rawClient.baseUrl}/pusher/authenticate`,
        auth: {
          headers: {
            Authorization: `Bearer ${client.rawClient.token}`,
            Accept: 'application/json',
            'X-Api-Version': '3',
            'Content-Type': 'application/json',
          },
        },
      });

      const channelName = environment
        ? `private-site-${realSiteId}-environment-${environment}`
        : `private-site-${realSiteId}`;

      const channel = pusher.subscribe(channelName);

      channel.bind('pusher:subscription_error', () => {
        reject(new Error('Could not subscribe to real-time events!'));
      });

      channel.bind('pusher:subscription_succeeded', () => {
        resolve([
          channel,
          () => {
            channels[cacheKey] = null;
            return pusher.disconnect();
          },
        ]);
      });
    });
  });

  channels[cacheKey] = promise;

  return promise;
}
