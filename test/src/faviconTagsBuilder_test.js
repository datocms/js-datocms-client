/* global memo:true */

import EntitiesRepo from '../../src/local/EntitiesRepo';
import faviconTagsBuilder from '../../src/utils/faviconTagsBuilder';

describe('faviconTagsBuilder', () => {
  let favicon;
  let result;
  let entitiesRepo;

  beforeEach(() => {
    favicon = memo(() => null);
    result = memo(() => faviconTagsBuilder(entitiesRepo()));

    entitiesRepo = memo(() => {
      const payload = {
        data: [
          {
            id: '681',
            type: 'site',
            attributes: {
              name: 'Site name',
              locales: ['en'],
              favicon: favicon(),
              imgix_host: 'www.datocms-assets.com',
            },
          },
          {
            id: '1000',
            type: 'upload',
            attributes: {
              format: 'png',
              size: '1000',
              width: '64',
              height: '64',
              title: '',
              alt: '',
              path: '/seo.png',
            },
          },
        ],
      };

      return new EntitiesRepo(payload);
    });
  });

  context('with no favicon', () => {
    it('builds meta tags', () => {
      expect(JSON.stringify(result())).to.eq(
        JSON.stringify([
          {
            tagName: 'meta',
            attributes: { name: 'application-name', content: 'Site name' },
          },
        ]),
      );
    });
  });

  context('with favicon', () => {
    beforeEach(() => {
      favicon = memo(() => '1000');
    });

    it('also builds favicon meta tags', () => {
      expect(JSON.stringify(result())).to.eq(
        JSON.stringify([
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '57x57',
              href:
                'https://www.datocms-assets.com/seo.png?w=57&h=57&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '60x60',
              href:
                'https://www.datocms-assets.com/seo.png?w=60&h=60&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '72x72',
              href:
                'https://www.datocms-assets.com/seo.png?w=72&h=72&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '76x76',
              href:
                'https://www.datocms-assets.com/seo.png?w=76&h=76&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '114x114',
              href:
                'https://www.datocms-assets.com/seo.png?w=114&h=114&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '120x120',
              href:
                'https://www.datocms-assets.com/seo.png?w=120&h=120&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '144x144',
              href:
                'https://www.datocms-assets.com/seo.png?w=144&h=144&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '152x152',
              href:
                'https://www.datocms-assets.com/seo.png?w=152&h=152&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'apple-touch-icon',
              sizes: '180x180',
              href:
                'https://www.datocms-assets.com/seo.png?w=180&h=180&auto=format',
            },
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'msapplication-square70x70',
              content:
                'https://www.datocms-assets.com/seo.png?w=70&h=70&auto=format',
            },
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'msapplication-square150x150',
              content:
                'https://www.datocms-assets.com/seo.png?w=150&h=150&auto=format',
            },
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'msapplication-square310x310',
              content:
                'https://www.datocms-assets.com/seo.png?w=310&h=310&auto=format',
            },
          },
          {
            tagName: 'meta',
            attributes: {
              name: 'msapplication-square310x150',
              content:
                'https://www.datocms-assets.com/seo.png?w=310&h=150&auto=format',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'icon',
              sizes: '16x16',
              href:
                'https://www.datocms-assets.com/seo.png?w=16&h=16&auto=format',
              type: 'image/png',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'icon',
              sizes: '32x32',
              href:
                'https://www.datocms-assets.com/seo.png?w=32&h=32&auto=format',
              type: 'image/png',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'icon',
              sizes: '96x96',
              href:
                'https://www.datocms-assets.com/seo.png?w=96&h=96&auto=format',
              type: 'image/png',
            },
          },
          {
            tagName: 'link',
            attributes: {
              rel: 'icon',
              sizes: '192x192',
              href:
                'https://www.datocms-assets.com/seo.png?w=192&h=192&auto=format',
              type: 'image/png',
            },
          },
          {
            tagName: 'meta',
            attributes: { name: 'application-name', content: 'Site name' },
          },
        ]),
      );
    });
  });
});
