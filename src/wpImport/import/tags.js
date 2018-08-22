import allPages from '../utils/allPages';

const { progress } = require('../utils/progress');

export default async function tags(dato, wp, itemTypeId) {
  const mapping = {};

  const resources = await allPages('Fetching tags', wp.tags());

  const tick = progress('Creating tags', resources.length);

  for (const tag of resources) {
    mapping[tag.id] = (await tick(
      tag.name,
      dato.items.create({
        itemType: itemTypeId,
        name: tag.name,
        slug: tag.slug,
      }),
    )).id;
  }

  return mapping;
}
