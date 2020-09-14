module.exports = async client => {
  await client.itemTypes.create({
    name: 'Article',
    apiKey: 'article',
  });
};
