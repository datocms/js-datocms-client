import { camelize } from 'humps';
import baseMkdirp from 'mkdirp';
import denodeify from 'denodeify';
import path from 'path';
import fs from 'fs';

const mkdirp = denodeify(baseMkdirp);

const defaultTemplate = `
'use strict';

module.exports = async (client) => {
  // DatoCMS migration script

  // For more examples, head to our Content Management API docs:
  // https://www.datocms.com/docs/content-management-api

  // Create an Article model:
  // https://www.datocms.com/docs/content-management-api/resources/item-type/create

  const articleModel = await client.itemTypes.create({
    name: 'Article',
    apiKey: 'article',
  });

  // Create a Title field (required):
  // https://www.datocms.com/docs/content-management-api/resources/field/create

  const titleField = await client.fields.create(articleModel.id, {
    label: 'Title',
    apiKey: 'title',
    fieldType: 'string',
    validators: {
      required: {},
    },
    appearance: {
      editor: 'single_line',
      parameters: {
        heading: true,
      },
      addons: [],
    },
  });

  // Create an Article record:
  // https://www.datocms.com/docs/content-management-api/resources/item/create

  const article = await client.items.create({
    itemType: articleModel.id,
    title: 'My first article!',
  });
}
`.trim();

const getTemplate = templatePath => {
  if (!templatePath) return defaultTemplate;
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf8');
  }

  return process.stderr.write(
    `Could not load template with path ${templatePath}`,
  );
};

export default async function toggleMaintenanceMode({
  name,
  relativeMigrationsDir,
  relativeMigrationTemplatePath,
}) {
  const migrationsDir = path.resolve(relativeMigrationsDir);
  const template = getTemplate(relativeMigrationTemplatePath);

  await mkdirp(migrationsDir);

  const timestamp = Math.floor(Date.now() / 1000);
  const migrationFile = `${timestamp}_${camelize(name)}.js`;
  const migrationAbsolutePath = path.join(migrationsDir, migrationFile);

  fs.writeFileSync(migrationAbsolutePath, template, 'utf8');

  process.stdout.write(
    `Created ${path.join(relativeMigrationsDir, migrationFile)}\n`,
  );
}
