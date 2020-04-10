/* global memo:true */

import { camelizeKeys } from 'humps';
import EntitiesRepo from '../../src/local/EntitiesRepo';
import { builders } from '../../src/utils/seoTagsBuilder';

describe('seoTagsBuilder', () => {
  let itemTitle;
  let seo;
  let globalSeo;
  let item;
  let noIndex;
  let entitiesRepo;
  let itemImage;
  let locales;

  beforeEach(() => {
    itemTitle = memo(() => ({ en: null }));
    globalSeo = memo(() => null);
    seo = memo(() => null);
    noIndex = memo(() => null);
    itemImage = memo(() => null);
    locales = memo(() => ['en', 'it']);

    entitiesRepo = memo(() => {
      const payload = camelizeKeys({
        data: [
          {
            id: '24038',
            type: 'item',
            attributes: {
              is_valid: true,
              title: itemTitle(),
              seo_settings: seo(),
              image: itemImage(),
            },
            meta: {
              updated_at: '2016-12-07T09:14:22Z',
            },
            relationships: {
              item_type: {
                data: {
                  id: '3781',
                  type: 'item_type',
                },
              },
            },
          },
          {
            id: '681',
            type: 'site',
            attributes: {
              name: 'XXX',
              locales: locales(),
              theme_hue: 190,
              domain: null,
              internal_domain: 'wispy-sun-3056.admin.datocms.com',
              global_seo: globalSeo(),
              favicon: null,
              no_index: noIndex(),
              ssg: null,
            },
            relationships: {
              menu_items: {
                data: [
                  {
                    id: '4212',
                    type: 'menu_item',
                  },
                ],
              },
              item_types: {
                data: [
                  {
                    id: '3781',
                    type: 'item_type',
                  },
                ],
              },
            },
          },
          {
            id: '3781',
            type: 'item_type',
            attributes: {
              name: 'Article',
              singleton: false,
              sortable: false,
              api_key: 'article',
            },
            relationships: {
              fields: {
                data: [
                  {
                    id: '15085',
                    type: 'field',
                  },
                  {
                    id: '15087',
                    type: 'field',
                  },
                ],
              },
              singleton_item: {
                data: null,
              },
              title_field: {
                data: {
                  type: 'field',
                  id: '15085',
                },
              },
            },
          },
          {
            id: '15085',
            type: 'field',
            attributes: {
              label: 'Title',
              field_type: 'string',
              api_key: 'title',
              hint: null,
              localized: true,
              validators: {
                required: {},
              },
              position: 2,
              appearance: {
                editor: 'single_line',
                parameters: { heading: false },
              },
            },
            relationships: {
              item_type: {
                data: {
                  id: '3781',
                  type: 'item_type',
                },
              },
            },
          },
          {
            id: '15087',
            type: 'field',
            attributes: {
              label: 'SEO settings',
              field_type: 'seo',
              api_key: 'seo_settings',
              hint: null,
              localized: true,
              validators: {},
              position: 4,
              appearance: {
                editor: 'seo',
                parameters: {},
              },
            },
            relationships: {
              item_type: {
                data: {
                  id: '3781',
                  type: 'item_type',
                },
              },
            },
          },
        ],
      });

      return new EntitiesRepo(payload);
    });

    item = memo(() => null);
  });

  describe('title()', () => {
    let result;
    let titleValue;

    beforeEach(() => {
      item = memo(() => entitiesRepo().findEntity('item', '24038'));
      globalSeo = memo(() =>
        camelizeKeys({
          en: {
            title_suffix: ' - Suffix!',
          },
        }),
      );
      seo = memo(() =>
        camelizeKeys({
          en: {
            title: 'SEO title',
          },
        }),
      );
      result = memo(() =>
        builders.title(item(), entitiesRepo(), { locale: 'en' }),
      );
      titleValue = memo(() => result()[0].content);
    });

    it('returns seo title with suffix', () => {
      expect(titleValue()).to.eq('SEO title - Suffix!');
    });
  });
});
