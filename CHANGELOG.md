## 2.0.3 - 2.0.4

* Fix in how we build SEO tags

## 2.0.2

* Fix in getting paginated items

## 2.0.1

* Introduced option `serializeRequest: false` option to every call. Use it if you want to send a raw JSON API requst to DatoCMS.

## 2.0.0

* `deserializeResponse: false` option no longer camelizes response

## 1.0.5

* Return 1 on `dato dump` errors, to allow better error handling inside CI processes or scripts.
* Contentful importer improvements (https://github.com/datocms/js-datocms-client/pull/35)
* Minor bug fixes

## 1.0.0

* Big rewrite, faster --watch mode

## 0.8.15

* If the client receives a 429 error message with no indication of wait time, assume it's 10 seconds

## 0.8.14

* Fixed two bugs in the WP importer, one about retrieve paginated contend and another with creating the "uncategorized" category that is not returned by the WP APIs.

## 0.8.13

* Fixed regression where you could no longer access items' item type via .itemType

## 0.8.12

* Fix Contentful importer. Fixes issues with spaces in model names and with linking assets and items

## 0.8.11

* Automatically wait in case we get API rate limits

## 0.8.6

* Support empty responses from server

## 0.8.4

* add Item .meta method to fetch record meta information

## 0.8.0

* babel-polyfill no longer gets required

## 0.7.1

* undefined values are now serialized into JSON payload

## 0.7.0

Major

* Added entry point for browser
* Removed SiteChangerWatcher from index.js import: SiteChangerWatcher, which uses pusher/node resulted in the crash below when using the package in a browser
* Replaced query-string with node querystring: this also required amending some of the tests, since querystring stringifies objects in different order (ie ?w=96&h96 instead of ?h=96&w=96). Note that query-string was returning an error when building the package with CRA.

Removal of following packages:

* node-fetch since isomorphic-fetch is a wrapper of node-fetch and is already used
* browser-or-node since node already exposes process.browser
* proxy-polyfill: honestly I'm not sure about that one, but I tried consuming the Proxy as a function as indicated here and it failed so I doubt the global import actually make the Proxy Polyfills work at all.

Minor

* eslint-config-airbnb-base is now part of dev dependenvcies as it should
* Added /test in eslint scope for lint:autocorrect task
* Most lint errors are fixed. Some of them are still in there (especially in the /test directory), I didn't want to remove useless variables, I'll let you guys do the cleaning.

## 0.6.3

* Made API errors more readable
* Allow snake-case keys on every API call (with warnings though)

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
