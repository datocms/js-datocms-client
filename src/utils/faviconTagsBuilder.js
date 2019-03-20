import buildFileUrl from './buildFileUrl';

const tag = (tagName, attributes) => ({ tagName, attributes });
const metaTag = (name, content) => tag('meta', { name, content });

const url = (favicon, entitiesRepo, params) => {
  const upload = entitiesRepo.findEntity('upload', favicon);
  return buildFileUrl(upload, entitiesRepo, params);
};

const builders = {
  apple(entitiesRepo) {
    const { site } = entitiesRepo;

    if (!site.favicon) return undefined;

    return [57, 60, 72, 76, 114, 120, 144, 152, 180].map(size => tag(
      'link',
      {
        rel: 'apple-touch-icon',
        sizes: `${size}x${size}`,
        href: url(site.favicon, entitiesRepo, { w: size, h: size }),
      },
    ));
  },

  windows(entitiesRepo) {
    const { site } = entitiesRepo;

    if (!site.favicon) return undefined;

    return [[70, 70], [150, 150], [310, 310], [310, 150]].map(([w, h]) => (
      metaTag(`msapplication-square${w}x${h}`, url(site.favicon, entitiesRepo, { w, h }))
    ));
  },

  icon(entitiesRepo) {
    const { site } = entitiesRepo;

    if (!site.favicon) return undefined;

    const upload = entitiesRepo.findEntity('upload', site.favicon);

    return [16, 32, 96, 192].map(size => tag(
      'link',
      {
        rel: 'icon',
        sizes: `${size}x${size}`,
        href: url(site.favicon, entitiesRepo, { w: size, h: size }),
        type: `image/${upload.format}`,
      },
    ));
  },

  appName(entitiesRepo) {
    const { site } = entitiesRepo;

    if (!site.name) return undefined;

    return metaTag('application-name', site.name);
  },
};

export default function faviconTagsBuilder(entitiesRepo) {
  return Object.values(builders).reduce((acc, builder) => {
    const result = builder(entitiesRepo);

    if (result) {
      if (Array.isArray(result)) {
        return [].concat(acc, result);
      }
      return [].concat(acc, [result]);
    }

    return acc;
  }, []);
}
