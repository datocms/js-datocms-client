import Bottleneck from 'bottleneck';

const MAX_CONCURRENT = 10;
const ITEMS_PER_PAGE = 500;

export default async function fetchAllPages(client, endpoint, params) {
  const limiter = new Bottleneck({
    maxConcurrent: MAX_CONCURRENT,
  });

  const baseResponse = await client.get(endpoint, {
    ...params,
    'page[limit]': ITEMS_PER_PAGE,
  });

  const totalCount = baseResponse.meta.total_count;

  const promises = [];

  for (
    let index = ITEMS_PER_PAGE;
    index < totalCount;
    index += ITEMS_PER_PAGE
  ) {
    promises.push(
      limiter.schedule(async () => {
        const response = await client.get(endpoint, {
          ...params,
          'page[offset]': index,
          'page[limit]': ITEMS_PER_PAGE,
        });
        return response;
      }),
    );
  }

  const data = await Promise.all(promises);

  const result = data.reduce(
    (response, results) => {
      response.data = response.data.concat(results.data);
      return response;
    },
    { ...baseResponse },
  );

  return result;
}
