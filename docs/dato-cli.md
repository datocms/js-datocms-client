# Integrating DatoCMS with your static website generator

[DatoCMS](https://www.datocms.com) is working hard to provide the easiest way to enable non-technical editors to update a completely static website — without the intervention of a developer — from the comfort of a user-friendly web interface, just like they're used with Wordpress and such.

Hugo, Hexo, Metalsmith, GatsbyJS, Brunch, Phenomic... the list of static site generators is [almost endless](https://www.staticgen.com/) and keeps on growing.

This package provides an easy way to integrate content coming from a DatoCMS into virtually any static website generator.

# How it works

All the websites built with a static website generator are made of:

* Static files which represent the actual content of the pages (usually written in Markdown + [front matter](https://jekyllrb.com/docs/frontmatter/), YAML, JSON or Toml);
* Some HTML templates that use these files to generate the actual static HTML pages you will upload online.

That means that, up until now, even the most basic change to a static website could only be performed by a tech-savvy user, as too many things had to be known (Git, Markdown syntax, proper editing of YAML/JSON/Toml files).

DatoCMS works differently:

1. You create a web administrative interface for your editors that fits exactly the needs of your static website;
2. Editors can make changes to the content of the website from that CMS interface you prepared;
3. Using this gem, all the data stored in your DatoCMS administrative interface can be transformed into local Markdown/YAML/JSON/Toml files, so that can be "digested" by the static website generator just as they were written by hand.

The process of translating the data coming from the API into static files can be performed both on your machine during the development process of the website, and in your Continuous Deployment service anytime the editors request a new "build" pressing a "Publish" button on the web interface.

Now your static website isn't static anymore! Isn't this awesome?! :-)

## Installing the CLI tool

Once you have a working NodeJS environment, you can use the CLI tool running these commands within your static website directory:

```
npm install datocms-client --save-dev
```

If everything worked correctly, you should now run `dato` and see something like this:

```
$ ./node_modules/.bin/dato
Usage:
  dato dump [--token=<apiToken>] [--config=<file>]
  dato -h | --help
  dato --version
```

Great! Now the easiest way to dump all the remote data into local files is to create a `dato.config.js` file into your project root directory with the following content:

```js
// dato.config.js

module.exports = (dato, root, i18n) => {
  // within a 'content' directory...
  root.directory('./content', dir => {

    // dump the global DatoCMS site setting into a 'site.yml' file
    dir.createDataFile(
      'site.yml',
      'yaml',
      dato.site.toMap()
    );

    // for each Item Type present in the DatoCMS backend...
    dato.itemTypes.forEach(itemType => {

      // dump the items in the collection into a YAML file
      dir.createDataFile(
        `${itemType.apiKey}.yml`,
        'yaml',
        dato.itemsOfType(itemType).map(item => item.toMap())
      );
    });
  });
};
```

And run the following command:

```
$ ./node_modules/.bin/dato dump --token=YOUR_SITE_READONLY_TOKEN
```

Hurray! A new `content` directory should have been generated with a YAML file for each item type and the site itself!

### Commands available in dato.config.js

The config file let us declare different kind of "operations":

| Command | Description |
| --- | --- |
| `createPost` | Generate Markdown + Frontmatter files |
| `createDataFile` | Generate plain Toml/YAML files |
| `addToDataFile` | Add some keys to an existing Toml/YAML file |

### How to fetch data from DatoCMS

Using the `dato` method you can access to any item stored in your site grouped by item type. That is, if your site has an Item Type with `post` as API identifier, you can get the complete array of items with `dato.posts` (the pluralized API identifier).

If a Item Type is marked as "single instance" (ie. `about_page`) you don't need to pluralize and a call to `dato.aboutPage` directly returns the item (or `nil`, if still hasn't been created within the CMS).

You can query an item's field value with a method called like the field API identifier.

Complex field types (ie. `image`, `file`, `video`, `seo`) implement specific methods you can use as well within the config file:

```
article = dato.articles[0]
article.coverImage.url(w: 500, fit: 'crop')
```

### Examples

To help you with your first integration, here's a list of sample websites integrated with DatoCMS we built:

* [Metalsmith](https://github.com/datocms/metalsmith-example)
* [Hexo](https://github.com/datocms/hexo-example)
* [Hugo](https://github.com/datocms/hugo-example)

### Need more help?

Just ask! Send us an email to [support@datocms.com](mailto:support@datocms.com) and we'll be happy to answer any question!
