# Create/edit sites within a DatoCMS account 

With this module, you can easily create, edit and destroy DatoCMS sites, as well as editing your account settings.

# Installation

Install `datocms-client` into your project:

```ruby
npm install datocms-client --save
```

## Usage

```javascript
import { AccountClient } from 'datocms-client';

(async () => {
  const client = new AccountClient('ACCOUNT_API_KEY');

  // fetch existing sites
  sites = await client.sites.all();

  // create a new site
  site = await client.sites.create({ name: 'Foobar' });

  // update an existing site
  await client.sites.update(site.id, { ...site, name: 'Blog' });

  // destroy an existing site
  await client.sites.destroy(site.id);
})();
```

## List of client methods

```javascript
client.account.find();
client.account.create(resourceAttributes);
client.account.update(resourceAttributes);

client.sites.find(site_id);
client.sites.all();
client.sites.create(resourceAttributes);
client.sites.update(siteId, resourceAttributes);
client.sites.destroy(siteId);
client.sites.duplicate(siteId, resourceAttributes);
```

