import Pusher from 'pusher-js/node';
import EntitiesRepo from './EntitiesRepo';

const PUSHER_API_KEY = '75e6ef0fe5d39f481626';

export default class Loader {
  constructor(client, previewMode = false) {
    this.client = client;
    this.previewMode = previewMode;
    this.entitiesRepo = new EntitiesRepo();
  }

  load() {
    return Promise.all([
      this.client.get('/site', { include: 'item_types,item_types.fields' }),
      this.client.items.all(
        { version: this.previewMode ? 'latest' : 'published' },
        { deserializeResponse: false, allPages: true },
      ),
      this.client.uploads.all({}, { deserializeResponse: false, allPages: true }),
    ])
      .then((payloads) => {
        this.entitiesRepo.upsertEntities(...payloads);
      });
  }

  async watch(notifier) {
    const site = await this.client.site.find();

    const pusher = new Pusher(
      PUSHER_API_KEY,
      {
        authEndpoint: 'https://site-api.datocms.com/pusher/authenticate',
        auth: {
          headers: {
            Authorization: `Bearer ${this.client.rawClient.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      },
    );

    const watcher = pusher.subscribe(`private-site-${site.id}`);

    watcher.bind('pusher:subscription_error', () => {
      process.stdout.write('Could not subscribe to the project live events... :(');
    });

    const addEventListener = (eventName, entitiesRepoRefresher) => {
      watcher.bind(eventName, (data) => {
        notifier(entitiesRepoRefresher(data));
      });
    };

    const itemVersion = this.previewMode ? 'latest' : 'published';
    const previewMode = this.previewMode ? 'preview_mode' : 'published_mode';

    addEventListener('site:upsert', async () => {
      const payloads = await Promise.all([
        this.client.get('/site', { include: 'item_types,item_types.fields' }),
        this.client.items.all(
          { version: itemVersion },
          { deserializeResponse: false, allPages: true },
        ),
      ]);

      this.entitiesRepo.upsertEntities(...payloads);
    });

    addEventListener(`item:${previewMode}:upsert`, async ({ ids }) => {
      const payload = await this.client.items.all(
        {
          'filter[ids]': ids.join(','),
          version: itemVersion,
        },
        { deserializeResponse: false, allPages: true },
      );

      this.entitiesRepo.upsertEntities(payload);
    });

    addEventListener(`item:${previewMode}:destroy`, ({ ids }) => {
      this.entitiesRepo.destroyEntities('item', ids);
    });

    addEventListener('upload:upsert', async ({ ids }) => {
      const payload = await this.client.uploads.all(
        { 'filter[ids]': ids.join(',') },
        { deserializeResponse: false, allPages: true },
      );

      this.entitiesRepo.upsertEntities(payload);
    });

    addEventListener('upload:destroy', ({ ids }) => {
      this.entitiesRepo.destroyEntities('upload', ids);
    });

    addEventListener('item_type:upsert', async ({ ids }) => {
      for (const id of ids) {
        const payloads = await Promise.all([
          this.client.itemTypes.find(id, {}, { deserializeResponse: false }),
          this.client.items.all(
            { 'filter[type]': id, version: itemVersion },
            { deserializeResponse: false, allPages: true },
          ),
        ]);

        this.entitiesRepo.upsertEntities(...payloads);
      }
    });

    addEventListener('item_type:destroy', ({ ids }) => {
      ids.forEach((id) => {
        this.entitiesRepo.destroyItemType(id);
      });
    });

    return pusher.disconnect.bind(pusher);
  }
}
