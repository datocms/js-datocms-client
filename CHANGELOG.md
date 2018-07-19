## 0.5.5

* Fixed problems with `client.fields.create` method

## 0.5.4

The big change is that the methods the client makes available are generated at runtime based on the [JSON Schema of our CMA](https://www.datocms.com/content-management-api/). This means any new API endpoint — or changes to existing ones — will instantly be reflected to the client, without the need to upgrade to the latest client version.

We also added a new `deserializeResponse` option to every call, that you can use if you want to retrieve the exact payload the DatoCMS returns:

```javascript
import { SiteClient } from 'datocms-client';

const client = new SiteClient("YOUR-API-KEY")

// `deserializeResponse` is true by default:
const accessToken = client.accessTokens.create(name: "New token", role: "34")

// {
//   id: "312",
//   hardcodedType: null,
//   name: "New token",
//   token: "XXXX",
//   role: "34"
// }

// if `deserializeResponse` is false, this will be the result
const accessToken = client.accessTokens.create({ name: "New token", role: "34" }, { deserializeResponse: false })

// {
//   data: {
//     type: "access_token",
//     id: "312",
//     attributes: {
//       name: "New token",
//       token: "XXXX",
//       hardcoded_type: nil
//     },
//     relationships: {
//       role: {
//         data: {
//           type: "role",
//           id: "34"
//         }
//       }
//     }
//   }
// }
```

In our doc pages we also added some examples for the super-handy `allPages` option which was already present since v0.3.29:

```javascript
// if you want to fetch all the pages with just one call:
client.items.all({ "filter[type]" => "44" }, { allPages: true })
```
