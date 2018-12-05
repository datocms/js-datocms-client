/* eslint-disable no-param-reassign */

module.exports = (dato, root, i18n) => {
  root.addToDataFile('site.yml', 'yaml', dato.site.toMap());
  root.createDataFile('foobar.toml', 'toml', { siteName: dato.site.name });

  i18n.availableLocales.forEach((locale) => {
    i18n.locale = locale;
    root.directory(locale, (localeDir) => {
      localeDir.directory('posts', (articlesDir) => {
        dato.articles.forEach((article) => {
          articlesDir.createPost(
            `${article.slug}.md`,
            'yaml',
            {
              frontmatter: article.toMap(),
              content: article.title,
            },
          );
        });
      });
    });
  });
};
