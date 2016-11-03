module.exports = (dato, root, i18n) => {
  i18n.availableLocales.forEach(locale => {
    i18n.locale = locale;
    root.directory(locale, localeDir => {
      localeDir.createDataFile('site.yml', 'yaml', dato.site.toMap());
      localeDir.directory('posts', postsDir => {
        dato.blogPosts.forEach(post => {
          postsDir.createPost(
            `${post.slug}.md`,
            'yaml',
            {
              frontmatter: post.toMap(),
              content: post.excerpt,
            }
          );
        });
      });
      localeDir.addToDataFile('foobar.yml', 'yml', { siteName: dato.site.name });
    });
  });
};
