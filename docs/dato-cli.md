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

```ruby
# dato.config.js
dato.available_locales.each do |locale|
  directory "content/#{locale}" do
    I18n.with_locale(locale) do
      create_data_file "site.yml", :yaml, dato.site.to_hash
      dato.item_types.each do |item_type|
        create_data_file "#{item_type.api_key}.yml", :yaml, 
          dato.items_of_type(item_type).map(&:to_hash)
      end
    end
  end
end
```

And run the following command:

```
$ bundle exec dato dump --token=SITE_READONLY_TOKEN 
```

Hurray! A new `content` directory should have been generated with a Yaml file for each item type and the site itself!

## Hugo step-by-step integration guide

That's just the beginning: it probably makes more sense if you generate local files following the precise guidelines of the static site generator you're using. You can easily configure the `dato.config.rb` file to achieve that.

Just to make things more down-to-heart, suppose we're working with a Hugo website with the following structure:

```
.
├── config.toml
├── content
|   ├── post
|   |   ├── first-post.md
|   |   └── ...
|   └── quote
|   |   ├── first-quote.md
|   |   └── ...
├── data
|   └── author
|       ├── mark.toml
|       └── ...
├── layouts
|   └── ...
└── static
    └── ...
```

Our job is to generate the Markdown files in the `content` directory from the data contained in our DatoCMS site. The Toml files contained in the in the `data` directory need to be generated as well.

### Set up the site

Using the DatoCMS web interface, we first create the following Item types:

* post
  - title (string, required, title)
  - publication_date (date, required)
  - body (text, required)

* author
  - name (string, required, title)
  - bio (text, required)

* quote
  - content (text, required)
  - author (link to author, required)

### Writing the config file

We then define how content stored in DatoCMS needs to be translated into local files inside the `dato.config.rb` config file. Let's start with posts:

```ruby
directory "content/post" do
  dato.posts.each do |item|
    create_post "#{item.slug}.md" do
      frontmatter :toml, {
        title: item.title,
        date: item.publication_date.to_s
      }

      content item.body
    end
  end
end
```

The DSL is quite terse! Basically we're declaring that:

1. we want to take possess of the directory `content/post` and manage it programmatically from now on;
2. we then iterate over each post stored in DatoCMS and...
3. for each post, we create a local markdown file:
  - named after the slugified version of the post title;
  - that contains the post body;
  - decorated with a Toml front matter with a `title` and `date` keys; 

Now we can run the following command:

```
$ bundle exec dato dump --token=SITE_READONLY_TOKEN 
```

And see the `content/post` directory emptied from previous content and filled with new files:

```
.
└── content
    └── post
        ├── lorem-ipsum.md
        ├── dolor-sit-amet.md
        ├── consectetur-adipisci.md
        └── ...
```

Let's open one of those Markdown files:

```
+++
title = "Lorem ipsum"
date = "2001-02-03"
+++

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
```

Awesome!! We can now continue using Hugo just like we're used to.

### A more complete config file

The config file let us declare different kind of "operations":

| Command | Description |
| --- | --- |
| `create_post` | Generate Markdown + Frontmatter files |
| `create_data_file` | Generate plain Toml/YAML files |
| `add_to_data_file` | Add some keys to an existing Toml/YAML file |

In fact, this is a more complete version of our `dato.config.rb` file:

```ruby
directory "content/post" do
  dato.posts.each do |item|
    create_post "#{item.slug}.md" do
      frontmatter :toml, {
        title: item.title,
        date: item.publication_date.to_s
      }

      content item.body
    end
  end
end

directory "content/quote" do
  dato.quotes.each_with_index do |item, i|
    create_post "#{item.id}.md" do
      frontmatter :toml, {
        title: "Quote number #{i}",
        weight: i
      }

      content item.content
    end
  end
end

directory "data/authors" do
  dato.authors.each do |item|
    create_data_file "#{item.name.slug}.toml", :toml, {
      name: item.name,
      bio: item.bio
    }
  end
end
```

### How to fetch data from DatoCMS

Using the `dato` method you can access to any item stored in your site grouped by item type. That is, if your site has an Item Type with `post` as API identifier, you can get the complete array of items with `dato.posts` (the pluralized API identifier).

If a Item Type is marked as "single instance" (ie. `about_page`) you don't need to pluralize and a call to `dato.about_page` directly returns the item (or `nil`, if still hasn't been created within the CMS).

You can query an item's field value with a method called like the field API identifier.

An item also features a `.slug` method:

* if an item type has a field of type `string` with a "Title" Presentation mode, than the method returns the slugified version of the title itself;
* otherwise, it just returns the unique identifier of the item;

Complex field types (ie. `image`, `file`, `video`, `seo`) implement specific methods you can use as well within the config file:

```
article = dato.articles.first

article.cover_image.url(w: 500, fit: 'crop')
article.video.iframe_embed(800, 600)
```

### Examples

To help you with your first integration, here's a list of sample websites integrated with DatoCMS we built:

* [Middleman](https://github.com/datocms/middleman-example)
* [Jekyll](https://github.com/datocms/jekyll-example)
* [Hugo](https://github.com/datocms/hugo-example)

### Need more help?

Just ask! Send us an email to [support@datocms.com](mailto:support@datocms.com) and we'll be happy to answer any question!


