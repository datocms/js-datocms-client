# Read DatoCMS content within the browser

With our library, you can easily read any content stored within your DatoCMS backend.

**IMPORTANT:** do not use and expose your read-write token within a webpage! Always use the read-only token!

# Installation

Add the following library to your page:

```html
<script src="https://unpkg.com/datocms-client/dist/client.shims.js"></script>
```

## Usage

```html
<script>
var client = new Dato.SiteClient('YOUR_SITE_API_READONLY_TOKEN')

client.items.all({ 'filter[type]': 'article' })
  .then(function(articles) {
    console.log(articles);
  });

client.items.find('123')
  .then(function(article) {
    console.log(article);
  });
</script>
```

# Example

http://codepen.io/steffoz/pen/wzQRWm
