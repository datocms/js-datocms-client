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
    itemTitle = memo(() => null);
    globalSeo = memo(() => null);
    seo = memo(() => null);
    noIndex = memo(() => null);
    itemImage = memo(() => null);
    locales = memo(() => ['en']);

    entitiesRepo = memo(() => {
      const payload = camelizeKeys({
        data: [
          {
            id: '24038',
            type: 'item',
            attributes: {
              is_valid: true,
              title: itemTitle(),
              another_string: 'Foo bar',
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
                    id: '15088',
                    type: 'field',
                  },
                  {
                    id: '15085',
                    type: 'field',
                  },
                  {
                    id: '15086',
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
            id: '15088',
            type: 'field',
            attributes: {
              label: 'Image',
              field_type: 'file',
              api_key: 'image',
              hint: null,
              localized: false,
              validators: {},
              position: 1,
              appearance: {
                editor: 'file',
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
          {
            id: '15085',
            type: 'field',
            attributes: {
              label: 'Title',
              field_type: 'string',
              api_key: 'title',
              hint: null,
              localized: false,
              validators: {
                required: {},
              },
              position: 2,
              appearance: {
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
            id: '15086',
            type: 'field',
            attributes: {
              label: 'Another string',
              field_type: 'string',
              api_key: 'another_string',
              hint: null,
              localized: false,
              validators: {},
              position: 3,
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
              localized: false,
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
          {
            id: '100000',
            type: 'upload',
            attributes: {
              format: 'png',
              size: '1000',
              width: '200',
              height: '200',
              title: '',
              alt: '',
              path: '/seo.png',
            },
          },
          {
            id: '100001',
            type: 'upload',
            attributes: {
              format: 'png',
              size: '1000',
              width: '200',
              height: '200',
              title: '',
              alt: '',
              path: '/fallback.png',
            },
          },
          {
            id: '100002',
            type: 'upload',
            attributes: {
              format: 'png',
              size: '1000',
              width: '200',
              height: '200',
              title: '',
              alt: '',
              path: '/image.png',
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
      result = memo(() => builders.title(item(), entitiesRepo()));
      titleValue = memo(() => result()[0].content);
    });

    context('with no fallback seo', () => {
      context('with no item', () => {
        it('returns no tags', () => {
          expect(result()).to.be.undefined();
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('no SEO', () => {
          it('returns no tags', () => {
            expect(result()).to.be.undefined();
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() =>
              camelizeKeys({
                title: 'SEO title',
              }),
            );
          });

          it('returns seo title', () => {
            expect(titleValue()).to.eq('SEO title');
          });
        });
      });
    });

    context('with fallback seo', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            fallback_seo: {
              title: 'Default title',
            },
          }),
        );
      });

      context('with no item', () => {
        it('returns fallback description', () => {
          expect(titleValue()).to.eq('Default title');
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('no SEO', () => {
          it('returns fallback description', () => {
            expect(titleValue()).to.eq('Default title');
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() =>
              camelizeKeys({
                title: 'SEO title',
              }),
            );
          });

          it('returns seo title', () => {
            expect(titleValue()).to.eq('SEO title');
          });

          context('with title suffix', () => {
            beforeEach(() => {
              globalSeo = memo(() =>
                camelizeKeys({
                  title_suffix: ' - Suffix!',
                }),
              );
            });

            it('returns seo title with suffix', () => {
              expect(titleValue()).to.eq('SEO title - Suffix!');
            });
          });
        });
      });
    });
  });

  describe('description()', () => {
    let result;
    let descriptionValue;
    let ogValue;
    let cardValue;

    beforeEach(() => {
      result = memo(() => builders.description(item(), entitiesRepo()));
      descriptionValue = memo(() => result()[0].attributes.content);
      ogValue = memo(() => result()[1].attributes.content);
      cardValue = memo(() => result()[2].attributes.content);
    });

    context('with no fallback seo', () => {
      context('with no item', () => {
        it('returns no tags', () => {
          expect(result()).to.be.undefined();
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('no SEO', () => {
          it('returns no tags', () => {
            expect(result()).to.be.undefined();
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() =>
              camelizeKeys({
                description: 'SEO description',
              }),
            );
          });

          it('returns seo description', () => {
            expect(descriptionValue()).to.eq('SEO description');
            expect(ogValue()).to.eq('SEO description');
            expect(cardValue()).to.eq('SEO description');
          });
        });
      });
    });

    context('with fallback seo', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            fallback_seo: {
              description: 'Default description',
            },
          }),
        );
      });

      context('with no item', () => {
        it('returns fallback description', () => {
          expect(descriptionValue()).to.eq('Default description');
          expect(ogValue()).to.eq('Default description');
          expect(cardValue()).to.eq('Default description');
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('no SEO', () => {
          it('returns fallback description', () => {
            expect(descriptionValue()).to.eq('Default description');
            expect(ogValue()).to.eq('Default description');
            expect(cardValue()).to.eq('Default description');
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() =>
              camelizeKeys({
                description: 'SEO description',
              }),
            );
          });

          it('returns seo description', () => {
            expect(descriptionValue()).to.eq('SEO description');
            expect(ogValue()).to.eq('SEO description');
            expect(cardValue()).to.eq('SEO description');
          });
        });
      });
    });
  });

  describe('twitterCard()', () => {
    let result;
    let twitterCardValue;

    beforeEach(() => {
      result = memo(() => builders.twitterCard(item(), entitiesRepo()));
      twitterCardValue = memo(() => result().attributes.content);
    });

    context('with no fallback seo', () => {
      context('with no item', () => {
        it('returns no tags', () => {
          expect(twitterCardValue()).to.eq('summary');
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('no SEO', () => {
          it('returns no tags', () => {
            expect(twitterCardValue()).to.eq('summary');
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() =>
              camelizeKeys({
                twitterCard: 'summary_large_image',
              }),
            );
          });

          it('returns seo twitterCard', () => {
            expect(twitterCardValue()).to.eq('summary_large_image');
          });
        });
      });
    });

    context('with fallback seo', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            fallback_seo: {
              twitterCard: 'summary_large_image',
            },
          }),
        );
      });

      context('with no item', () => {
        it('returns fallback description', () => {
          expect(twitterCardValue()).to.eq('summary_large_image');
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('no SEO', () => {
          it('returns fallback description', () => {
            expect(twitterCardValue()).to.eq('summary_large_image');
          });
        });

        context('with SEO', () => {
          beforeEach(() => {
            seo = memo(() =>
              camelizeKeys({
                twitterCard: 'foobar',
              }),
            );
          });

          it('returns seo twitterCard', () => {
            expect(twitterCardValue()).to.eq('foobar');
          });
        });
      });
    });
  });

  describe('robots()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.robots(null, entitiesRepo()));
    });

    context('with site noIndex set', () => {
      beforeEach(() => {
        noIndex = memo(() => true);
      });

      it('returns robots meta tag', () => {
        expect(result().attributes.content).to.eq('noindex');
      });
    });

    context('with site noIndex not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });
  });

  describe('twitterSite()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.twitterSite(null, entitiesRepo()));
    });

    context('with twitter account not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with twitter account set', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            twitter_account: '@steffoz',
          }),
        );
      });

      it('returns robots meta tag', () => {
        expect(result().attributes.content).to.eq('@steffoz');
      });
    });
  });

  describe('articleModifiedTime()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.articleModifiedTime(item(), entitiesRepo()));
    });

    context('with no item', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with item', () => {
      beforeEach(() => {
        item = memo(() => entitiesRepo().findEntity('item', '24038'));
      });

      it('returns iso 8601 datetime', () => {
        expect(result().attributes.content).to.eq('2016-12-07T09:14:22Z');
      });
    });
  });

  describe('articlePublisher()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.articlePublisher(null, entitiesRepo()));
    });

    context('with FB page not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with FB page set', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            facebook_page_url: 'http://facebook.com/mark.smith',
          }),
        );
      });

      it('returns robots meta tag', () => {
        expect(result().attributes.content).to.eq(
          'http://facebook.com/mark.smith',
        );
      });
    });
  });

  describe('ogLocale()', () => {
    it('returns current i18n locale', () => {
      const result = builders.ogLocale(null, null, { locale: 'en' });
      expect(result.attributes.content).to.eq('en_EN');
    });

    it('returns current i18n locale', () => {
      const result = builders.ogLocale(null, null, { locale: 'en-US' });
      expect(result.attributes.content).to.eq('en_US');
    });
  });

  describe('ogType()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.ogType(item(), entitiesRepo()));
    });

    context('with no item', () => {
      it('returns website og:type', () => {
        expect(result().attributes.content).to.eq('website');
      });
    });

    context('with item', () => {
      beforeEach(() => {
        item = memo(() => entitiesRepo().findEntity('item', '24038'));
      });

      it('returns article og:type', () => {
        expect(result().attributes.content).to.eq('article');
      });
    });
  });

  describe('ogSiteName()', () => {
    let result;

    beforeEach(() => {
      result = memo(() => builders.ogSiteName(null, entitiesRepo()));
    });

    context('with site name not set', () => {
      it('returns no tags', () => {
        expect(result()).to.be.undefined();
      });
    });

    context('with site name set', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            site_name: 'My site',
          }),
        );
      });

      it('returns og:site_name tag', () => {
        expect(result().attributes.content).to.eq('My site');
      });
    });
  });

  describe('image()', () => {
    let result;
    let ogValue;
    let cardValue;

    beforeEach(() => {
      ogValue = memo(() => result()[0].attributes.content);
      cardValue = memo(() => result()[1].attributes.content);
      result = memo(() => builders.image(item(), entitiesRepo()));
    });

    context('with no fallback seo', () => {
      context('with no item', () => {
        it('returns no tags', () => {
          expect(result()).to.be.undefined();
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('with no image', () => {
          context('no SEO', () => {
            it('returns no tags', () => {
              expect(result()).to.be.undefined();
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() =>
                camelizeKeys({
                  image: '100000',
                }),
              );
            });

            it('returns seo image', () => {
              expect(ogValue()).to.include('seo.png');
              expect(cardValue()).to.include('seo.png');
            });
          });
        });

        context('with image', () => {
          beforeEach(() => {
            itemImage = memo(() => {
              return { uploadId: '100002' };
            });
          });

          context('no SEO', () => {
            it('returns item image', () => {
              expect(ogValue()).to.include('image.png');
              expect(cardValue()).to.include('image.png');
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() =>
                camelizeKeys({
                  image: '100000',
                }),
              );
            });

            it('returns SEO image', () => {
              expect(ogValue()).to.include('seo.png');
              expect(cardValue()).to.include('seo.png');
            });
          });
        });
      });
    });

    context('with fallback seo', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            fallback_seo: {
              image: '100001',
            },
          }),
        );
      });

      context('with no item', () => {
        it('returns fallback image', () => {
          expect(ogValue()).to.include('fallback.png');
          expect(cardValue()).to.include('fallback.png');
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('with no image', () => {
          context('no SEO', () => {
            it('returns fallback image', () => {
              expect(ogValue()).to.include('fallback.png');
              expect(cardValue()).to.include('fallback.png');
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() =>
                camelizeKeys({
                  image: '100000',
                }),
              );
            });

            it('returns seo image', () => {
              expect(ogValue()).to.include('seo.png');
              expect(cardValue()).to.include('seo.png');
            });
          });
        });

        context('with image', () => {
          beforeEach(() => {
            itemImage = memo(() => {
              return { uploadId: '100002' };
            });
          });

          context('no SEO', () => {
            it('returns item image', () => {
              expect(ogValue()).to.include('image.png');
              expect(cardValue()).to.include('image.png');
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() =>
                camelizeKeys({
                  image: '100000',
                }),
              );
            });

            it('returns SEO image', () => {
              expect(ogValue()).to.include('seo.png');
              expect(cardValue()).to.include('seo.png');
            });
          });
        });
      });
    });

    context('with translated fallback seo', () => {
      beforeEach(() => {
        globalSeo = memo(() =>
          camelizeKeys({
            en: {
              fallbackSeo: {
                image: '100001',
              },
            },
          }),
        );
        locales = memo(() => ['en', 'it']);
        result = memo(() =>
          builders.image(item(), entitiesRepo(), { locale: 'en' }),
        );
      });

      context('with no item', () => {
        it('returns fallback image', () => {
          expect(ogValue()).to.include('fallback.png');
          expect(cardValue()).to.include('fallback.png');
        });
      });

      context('with item', () => {
        beforeEach(() => {
          item = memo(() => entitiesRepo().findEntity('item', '24038'));
        });

        context('with no image', () => {
          context('no SEO', () => {
            it('returns fallback image', () => {
              expect(ogValue()).to.include('fallback.png');
              expect(cardValue()).to.include('fallback.png');
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() =>
                camelizeKeys({
                  image: '100000',
                }),
              );
            });

            it('returns seo image', () => {
              expect(ogValue()).to.include('seo.png');
              expect(cardValue()).to.include('seo.png');
            });
          });
        });

        context('with image', () => {
          beforeEach(() => {
            itemImage = memo(() => {
              return { uploadId: '100002' };
            });
          });

          context('no SEO', () => {
            it('returns item image', () => {
              expect(ogValue()).to.include('image.png');
              expect(cardValue()).to.include('image.png');
            });
          });

          context('with SEO', () => {
            beforeEach(() => {
              seo = memo(() =>
                camelizeKeys({
                  image: '100000',
                }),
              );
            });

            it('returns SEO image', () => {
              expect(ogValue()).to.include('seo.png');
              expect(cardValue()).to.include('seo.png');
            });
          });
        });
      });
    });
  });
});
