/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const { render } = require('datocms-structured-text-to-html-string');

module.exports = (dato, root, i18n) => {
  root.addToDataFile('site.yml', 'yaml', dato.site.toMap());
  root.createDataFile('foobar.toml', 'toml', { siteName: dato.site.name });

  i18n.availableLocales.forEach(locale => {
    i18n.locale = locale;
    root.directory(locale, localeDir => {
      localeDir.directory('posts', articlesDir => {
        dato.articles.forEach(article => {
          articlesDir.createPost(`${article.slug}.md`, 'yaml', {
            frontmatter: {
              ...article.toMap(),
              croppedUrl: article.image.url({ fit: 'crop', w: 40, h: 40 }),
              structuredText: {
                ...article.content.toMap(),
                excerpt: render(article.content, {
                  renderInlineRecord: ({ adapter, record }) => {
                    switch (record.itemType.apiKey) {
                      case 'author':
                        return adapter.renderNode(
                          'a',
                          { href: `/authors/${record.name.toLowerCase()}` },
                          record.name,
                        );
                      default:
                        return null;
                    }
                  },
                  renderLinkToRecord: ({ record, children, adapter }) => {
                    switch (record.itemType.apiKey) {
                      case 'author':
                        return adapter.renderNode(
                          'a',
                          { href: `/authors/${record.name.toLowerCase()}` },
                          children,
                        );
                      default:
                        return null;
                    }
                  },
                  renderBlock: ({ record, adapter }) => {
                    switch (record.itemType.apiKey) {
                      case 'block':
                        return adapter.renderNode('figure', null, record.text);
                      default:
                        return null;
                    }
                  },
                }),
              },
            },
            content: article.title,
          });
        });
      });
    });
  });
};
