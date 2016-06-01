# DatoCMS JS Client

[![Build Status](https://travis-ci.org/datocms/js-datocms-client.svg?branch=master)](https://travis-ci.org/datocms/js-datocms-client)

## Browser

```html
<body>
  <script src="https://npmcdn.com/datocms-client/dist/datocms-client.min.js"></script>
  <script>
    var dato;

    DatoCmsClient.readOnlySession({
      domain: 'funky-sea-4874.admin.datocms.com',
      token: 'XXXYYY',
    })
    .then(function(session) {
      dato = new DatoCmsClient.RecordsRepo(session);
      return dato.refresh();
    })
    .then(function() {
      console.log(dato.find('9288').id);
      console.log(dato.find('9288').title);
      console.log(dato.find('9288').image.url({ w: 50 }));
    })
    .catch(function(e) {
      console.log(e);
    });
  </script>
</body>
```

## Node.js

```bash
npm install --save datocms-client
```

```js
import { readOnlySession, RecordsRepo } from 'datocms-client';

let dato;

readOnlySession({
  domain: 'funky-sea-4874.admin.datocms.com',
  token: 'XXXYYY',
})
.then(function(session) {
  dato = new RecordsRepo(session);
  return dato.refresh();
})
.then(function() {
  console.log(dato.find('9288').id);
  console.log(dato.find('9288').title);
  console.log(dato.find('9288').image.url({ w: 50 }));
})
.catch(function(e) {
  console.log(e);
});
```
