import EntitiesRepo from '../../src/local/EntitiesRepo';
import ItemsRepo from '../../src/local/ItemsRepo';
import faviconTagsBuilder, { builders } from '../../src/utils/faviconTagsBuilder';
import { camelizeKeys } from 'humps';

describe('faviconTagsBuilder', () => {
  let favicon, result, itemsRepo, site;

  beforeEach(() => {
    favicon = memo(() => null);
    result = memo(() => faviconTagsBuilder(site(), '#ff0000') );
    site = memo(() => itemsRepo().site);

    itemsRepo = memo(() => {
      const payload = camelizeKeys({
        data: {
          "id": "681",
          "type": "site",
          "attributes": {
            "name": "Site name",
            "locales": [ "en" ],
            "favicon": favicon(),
            "imgix_host": "www.datocms-assets.com"
          }
        }
      });

      const entitiesRepo = new EntitiesRepo(payload);
      return new ItemsRepo(entitiesRepo);
    });
  });

  context('with no favicon', () => {
    it('builds meta tags', () => {
      expect(JSON.stringify(result())).to.eq(JSON.stringify([
        { tagName: 'meta', attributes: { name: 'application-name', content: 'Site name' } },
        { tagName: 'meta', attributes: { name: 'theme-color', content: '#ff0000' } },
        { tagName: 'meta', attributes: { name: 'msapplication-TileColor', content: '#ff0000' } }
      ]));
    });
  });

  context('with favicon', () => {
    beforeEach(() => {
      favicon = memo(() => camelizeKeys({
        "path": "/seo.png",
        "width": 500,
        "height": 500,
        "format": "png",
        "size": 572451
      }));
    });

    it('also builds favicon meta tags', () => {
      expect(JSON.stringify(result())).to.eq(JSON.stringify([
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '57x57', href: 'https://www.datocms-assets.com/seo.png?h=57&w=57' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '60x60', href: 'https://www.datocms-assets.com/seo.png?h=60&w=60' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '72x72', href: 'https://www.datocms-assets.com/seo.png?h=72&w=72' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '76x76', href: 'https://www.datocms-assets.com/seo.png?h=76&w=76' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '114x114', href: 'https://www.datocms-assets.com/seo.png?h=114&w=114' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '120x120', href: 'https://www.datocms-assets.com/seo.png?h=120&w=120' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '144x144', href: 'https://www.datocms-assets.com/seo.png?h=144&w=144' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '152x152', href: 'https://www.datocms-assets.com/seo.png?h=152&w=152' } },
        { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://www.datocms-assets.com/seo.png?h=180&w=180' } },
        { tagName: 'meta', attributes: { name: 'msapplication-square70x70', content: 'https://www.datocms-assets.com/seo.png?h=70&w=70' } },
        { tagName: 'meta', attributes: { name: 'msapplication-square150x150', content: 'https://www.datocms-assets.com/seo.png?h=150&w=150' } },
        { tagName: 'meta', attributes: { name: 'msapplication-square310x310', content: 'https://www.datocms-assets.com/seo.png?h=310&w=310' } },
        { tagName: 'meta', attributes: { name: 'msapplication-square310x150', content: 'https://www.datocms-assets.com/seo.png?h=150&w=310' } },
        { tagName: 'link', attributes: { rel: 'icon', sizes: '16x16', href: 'https://www.datocms-assets.com/seo.png?h=16&w=16', type: 'image/png' } },
        { tagName: 'link', attributes: { rel: 'icon', sizes: '32x32', href: 'https://www.datocms-assets.com/seo.png?h=32&w=32', type: 'image/png' } },
        { tagName: 'link', attributes: { rel: 'icon', sizes: '96x96', href: 'https://www.datocms-assets.com/seo.png?h=96&w=96', type: 'image/png' } },
        { tagName: 'link', attributes: { rel: 'icon', sizes: '192x192', href: 'https://www.datocms-assets.com/seo.png?h=192&w=192', type: 'image/png' } },
        { tagName: 'meta', attributes: { name: 'application-name', content: 'Site name' } },
        { tagName: 'meta', attributes: { name: 'theme-color', content: '#ff0000' } },
        { tagName: 'meta', attributes: { name: 'msapplication-TileColor', content: '#ff0000' } }
      ]));
    });
  });
});

