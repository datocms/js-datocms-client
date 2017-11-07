module.exports = (dato, root, i18n) => {
  i18n.availableLocales.forEach(locale => {
    i18n.locale = locale;
    root.directory(locale, localeDir => {
      localeDir.createDataFile('site.yml', 'yaml', dato.site.toMap());
      localeDir.directory('posts', worksDir => {
        dato.works.forEach(work => {
          worksDir.createPost(
            `${work.slug}.md`,
            'yaml',
            {
              frontmatter: work.toMap(),
              content: work.excerpt,
            }
          );
        });
      });
      localeDir.addToDataFile('foobar.yml', 'yml', { siteName: dato.site.name });
    });
  });
};
