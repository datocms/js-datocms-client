import allPages from '../utils/allPages';

const { progress } = require('../utils/progress');

export default async function categories(dato, wp, itemTypeId) {
  const mapping = {};

  const resources = await allPages('Fetching categories', wp.categories());

  const tick = progress('Creating categories', resources.length + 1);

  for (const category of resources) {
    mapping[category.id] = (await tick(
      category.name,
      dato.items.create({
        itemType: itemTypeId,
        name: category.name,
        slug: category.slug,
        description: category.description,
      }),
    )).id;
  }
  mapping[1] = (await tick(
    'Uncategorized',
    dato.items.create({
      itemType: itemTypeId,
      name: 'Uncategorized',
      slug: 'uncategorized',
      description: 'Uncategorized',
    }),
  )).id;

  const childCategories = resources.filter(c => c.parent);

  const tick2 = progress('Reordering categories', childCategories.length);

  for (const category of childCategories) {
    await tick2(
      category.name,
      dato.items.update(mapping[category.id], {
        parentId: mapping[category.parent],
        position: 0,
      }),
    );
  }

  return mapping;
}
