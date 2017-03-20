# DatoCMS JS Client

[![Build Status](https://travis-ci.org/datocms/js-datocms-client.svg?branch=master)](https://travis-ci.org/datocms/js-datocms-client)

CLI tool for [DatoCMS](https://www.datocms.com).

## How to integrate DatoCMS with your static website

Please head over our documentation to learn everything you need:

* [Hugo](https://docs.datocms.com/hugo/overview.html)
* [Metalsmith](https://docs.datocms.com/metalsmith/overview.html)
* [Other generators](https://docs.datocms.com/other/overview.html)

## API Client

This package also exposes an API client, useful ie. to import existing content in your DatoCMS administrative area. Read our [documentation](https://docs.datocms.com/api-client/nodejs.html) for detailed info.

## Development

After checking out the repo, run `npm install` and `bundle install` to install dependencies. Then, run `npm test` to run the tests.

### Updating the client when the API changes

The DatoCMS API provides an always up-to-date [JSON Hyperschema](http://json-schema.org/latest/json-schema-hypermedia.html): the code of this package is generated automatically starting from the schema running `rake regenerate`.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/datocms/js-datocms-client. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The package is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
