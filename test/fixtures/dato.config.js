/* eslint-disable no-param-reassign */

module.exports = (dato, root, i18n) => {
  i18n.availableLocales.forEach((locale) => {
    i18n.locale = locale;
    root.directory(locale, (localeDir) => {
      localeDir.createDataFile('site.yml', 'yaml', dato.site.toMap());
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
      localeDir.addToDataFile('foobar.yml', 'yml', { siteName: dato.site.name });
    });
  });
};
