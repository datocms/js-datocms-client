import allPages from '../utils/allPages';

const { progress } = require('../utils/progress');

export default async function authors(dato, wp, itemTypeId) {
  const mapping = {};

  const resources = await allPages('Fetching authors', wp.users());

  const tick = progress('Creating authors', resources.length);

  for (const author of resources) {
    mapping[author.id] = (await tick(
      author.name,
      dato.items.create({
        itemType: itemTypeId,
        name: author.name,
        slug: author.slug,
        username: author.username,
        firstName: author.first_name,
        lastName: author.last_name,
        email: author.email,
        url: author.url,
        description: author.description,
        nickname: author.nickname,
      }),
    )).id;
  }

  return mapping;
}
