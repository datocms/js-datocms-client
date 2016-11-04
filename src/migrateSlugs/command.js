import PrettyError from 'pretty-error';
import { Spinner } from 'cli-spinner';
import SiteClient from '../site/SiteClient';
import deserializeJsonApi from '../deserializeJsonApi';
import slugify from '../utils/slugify';
import ApiException from '../ApiException';

export default function (options) {
  const token = options['--token'] || process.env.DATO_API_TOKEN;
  const skipIdPrefix = options['--skip-id-prefix'];

  if (!token) {
    process.stdout.write(
      'Missing API token: use the --token option or set an DATO_API_TOKEN environment variable!\n'
    );
    process.exit(1);
  }

  const client = new SiteClient(token, { 'X-Reason': 'migrate-slugs' }, 'http://site-api.lvh.me:3001');

  const spinner = new Spinner('%s Fetching site informations...');
  spinner.setSpinnerString(18);
  spinner.start();

  async function addSlugField(field) {
    const validators = {
      unique: {},
    };

    if (field.validators.required) {
      validators.required = {};
    }

    const slugField = await client.fields.create(
      field.itemType,
      {
        fieldType: 'slug',
        appeareance: { titleFieldId: field.id },
        validators,
        position: 99,
        apiKey: 'slug',
        label: 'Slug',
        hint: '',
        localized: field.localized,
      }
    );

    return await client.fields.update(
      slugField.id,
      {
        position: field.position + 1,
      }
    );
  }

  function times(n) {
    /* eslint-disable prefer-spread */
    return Array.apply(null, { length: n }).map(Number.call, Number);
    /* eslint-enable prefer-spread */
  }

  function itemsFor(itemTypeId) {
    const itemsPerPage = 500;

    return client.get(
      '/items',
      { 'page[limit]': itemsPerPage, 'filter[type]': itemTypeId }
    )
    .then((baseResponse) => {
      const pages = Math.ceil(baseResponse.meta.total_count / itemsPerPage);

      const extraFetches = times(pages - 1)
      .map((extraPage) => {
        return client.get(
          '/items',
          {
            'page[offset]': itemsPerPage * (extraPage + 1),
            'page[limit]': itemsPerPage,
          }
        ).then(response => response.data);
      });

      return Promise.all(extraFetches).then(x => [x, baseResponse]);
    })
    .then(([datas, baseResponse]) => {
      return deserializeJsonApi(Object.assign(
        {}, baseResponse,
        {
          data: baseResponse.data.concat(...datas),
        }
      ));
    });
  }

  function simpleSlugify(item, title, suffix) {
    const slug = slugify(title);

    if (skipIdPrefix) {
      return `${slug}${suffix}`;
    }

    return `${item.id}-${slug}${suffix}`;
  }

  function localizedSlugify(item, title, suffix) {
    if (typeof title === 'object') {
      return Object.entries(title).reduce((acc, [locale, value]) => {
        return Object.assign({}, acc, { [locale]: simpleSlugify(item, value, suffix) });
      }, {});
    }

    return simpleSlugify(item, title, suffix);
  }

  async function updateItem(titleField, item) {
    const title = item[titleField.apiKey];
    let counter = 0;

    /* eslint-disable no-constant-condition */
    while (1) {
      const slug = localizedSlugify(
        item,
        title,
        counter === 0 ? '' : `-${counter}`
      );

      try {
        return await client.items.update(
          item.id,
          Object.assign({}, item, { slug })
        );
      } catch (e) {
        if (e instanceof ApiException) {
          const { id, attributes } = e.body.data[0];

          if (
            id === 'INVALID_FIELD' &&
            attributes.details.field === 'slug' &&
            attributes.details.code === 'VALIDATION_UNIQUE'
          ) {
            counter += 1;
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      }
    }
    /* eslint-enable no-constant-condition */
  }

  async function run() {
    const itemTypes = await client.itemTypes.all();

    const titleFields = (await Promise.all(itemTypes.map(async (itemType) => {
      const fields = await client.fields.all(itemType.id);
      const anySlugPresent = fields.some(f => f.fieldType === 'slug' || f.apiKey === 'slug');

      if (anySlugPresent) {
        return null;
      }

      return fields.find(field => field.fieldType === 'string' && field.appeareance.type === 'title');
    }))).filter(field => !!field);

    spinner.setSpinnerTitle('Updating site...');

    await Promise.all(
      titleFields.map(async (titleField) => {
        await addSlugField(titleField);
        const items = await itemsFor(titleField.itemType);

        await Promise.all(
          items.map(async item => await updateItem(titleField, item))
        );
      })
    );
  }

  const pe = new PrettyError();

  return run()
  .then(() => {
    spinner.stop();
    process.stdout.write('\n\x1b[32m✓\x1b[0m Done!\n');
  })
  .catch((e) => {
    spinner.stop();
    process.stdout.write(pe.render(e));
  });
}
