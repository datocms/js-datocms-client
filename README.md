# DatoCMS JS Client

[![Build Status](https://travis-ci.org/datocms/js-datocms-client.svg?branch=master)](https://travis-ci.org/datocms/js-datocms-client)

NodeJS/Browser client and CLI for [DatoCMS](https://datocms.com).

[DatoCMS](https://www.datocms.com/) is a fully customizable administrative area for your static websites:

1. Use your favorite static website generator (Metalsmith, Hexo, Gatsby, and many others);
2. Let your clients publish new content independently;
3. Connect and build your site with any Continuous Deployment service (Netlify, Gitlab, CircleCI, etc.);
4. Host the site anywhere you like (Amazon S3, Netlify, Surge.sh, etc.)

## Usage

This module can be used in different ways, so the documentation is split up in different files:

* [I want to use the content of a DatoCMS site in my static website (Metalsmith, Hexo, etc)](https://github.com/datocms/js-datocms-client/blob/master/docs/dato-cli.md);
* [I want to edit the contents of an existing DatoCMS site programmatically](https://github.com/datocms/js-datocms-client/blob/master/docs/site-api-client.md);
* [I want to fetch DatoCMS content from the browser, to enhance my static website](https://github.com/datocms/js-datocms-client/blob/master/docs/browser-api-client.md);
* [I want to create new DatoCMS sites programmatically](https://github.com/datocms/js-datocms-client/blob/master/docs/account-api-client.md).

## Development

After checking out the repo, run `npm install` and `bundle install` to install dependencies. Then, run `npm test` to run the tests.

### Updating the client when the API changes

The DatoCMS API provides an always up-to-date [JSON Hyperschema](http://json-schema.org/latest/json-schema-hypermedia.html): the code of this package is generated automatically starting from the schema running `rake regenerate`.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/datocms/js-datocms-client. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The package is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
