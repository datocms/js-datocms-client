const tag = (tagName, attributes) => ({ tagName, attributes });
const metaTag = (name, content) => tag('meta', { name, content });

const builders = {
  apple(site) {
    if (!site.favicon) return undefined;

    return [57, 60, 72, 76, 114, 120, 144, 152, 180].map(size =>
      tag(
        'link',
        {
          rel: 'apple-touch-icon',
          sizes: `${size}x${size}`,
          href: site.favicon.url({ w: size, h: size }),
        }
      )
    );
  },

  windows(site) {
    if (!site.favicon) return undefined;

    return [[70, 70], [150, 150], [310, 310], [310, 150]].map(([w, h]) =>
      metaTag(`msapplication-square${w}x${h}`, site.favicon.url({ w, h }))
    );
  },

  icon(site) {
    if (!site.favicon) return undefined;

    return [16, 32, 96, 192].map(size =>
      tag(
        'link',
        {
          rel: 'icon',
          sizes: `${size}x${size}`,
          href: site.favicon.url({ w: size, h: size }),
          type: `image/${site.favicon.format}`,
        }
      )
    );
  },

  appName(site) {
    if (!site.name) return undefined;

    return metaTag('application-name', site.name);
  },

  themeColor(site, themeColor) {
    if (!themeColor) return undefined;

    return [
      metaTag('theme-color', themeColor),
      metaTag('msapplication-TileColor', themeColor),
    ];
  },
};

export default function faviconTagsBuilder(site, themeColor = null) {
  return Object.values(builders).reduce((acc, builder) => {
    const result = builder(site, themeColor);

    if (result) {
      if (Array.isArray(result)) {
        return [].concat(acc, result);
      }
      return [].concat(acc, [result]);
    }

    return acc;
  }, []);
}
