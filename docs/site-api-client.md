# Edit the contents of an existing DatoCMS site

With this module, you can easily create, edit and destroy any object within a DatoCMS site:

- Item types
- Fields
- Items
- Menu items
- Users

# Installation

Install `datocms-client` into your project:

```ruby
npm install datocms-client --save
```

## Usage

```javascript
import { SiteClient } from 'datocms-client';

(async () => {
  const client = new SiteClient('YOUR_SITE_API_READWRITE_TOKEN');

  // create a new Article item type
  const articleType = await client.itemTypes.create({
    name: 'Article',
    singleton: false,
    sortable: false,
    apiKey: 'article',
  });

  // add a Title field to the Article item type
  await client.fields.create(articleType.id, {
    label: 'Title',
    apiKey: 'title',
    fieldType: 'string',
    appearance: {
      editor: 'single_line',
      parameters: { heading: true },
    },
    hint: 'This is a title',
    validators: { required: {} },
  });

  // add an Image field to the Article item type
  await client.fields.create(articleType.id, {
    label: 'Image',
    apiKey: 'image',
    fieldType: 'image',
    hint: 'Choose the cover image for your article',
    validators: { required: {} },
  });

  // create a new Article
  await client.items.create({
    itemType: articleType.id,
    title: 'My first article!',
    image: await client.uploadImage('http://i.giphy.com/NXOF5rlaSXdAc.gif'),
  });

  // fetch by ID and edit an existing Article
  const article = await client.items.find('1234');
  await client.items.update('1234', { ...article, title: 'New title' });

  // destroy an existing article
  await client.items.destroy('1234');
})();
```

## List of client methods

```javascript
client.fields.create(itemTypeId, resourceAttributes);
client.fields.update(fieldId, resourceAttributes);
client.fields.all(itemTypeId);
client.fields.find(fieldId);
client.fields.destroy(fieldId);

client.items.create(resourceAttributes);
client.items.update(itemId, resourceAttributes);
client.items.all();
client.items.find(itemId);
client.items.destroy(itemId);

client.itemTypes.create(resourceAttributes);
client.itemTypes.update(itemTypeId, resourceAttributes);
client.itemTypes.all();
client.itemTypes.find(itemTypeId);
client.itemTypes.destroy(itemTypeId);

client.menuItems.create(resourceAttributes);
client.menuItems.update(menuItemId, resourceAttributes);
client.menuItems.all();
client.menuItems.find(menuItemId);
client.menuItems.destroy(menuItemId);

client.site.find();
client.site.update(resourceAttributes);

client.uploadImage(pathOrUrl);
client.uploadFile(pathOrUrl);

client.users.create(resourceAttributes);
client.users.all();
client.users.find(userId);
client.users.destroy(userId);
```
