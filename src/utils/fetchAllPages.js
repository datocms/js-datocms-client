import Bottleneck from 'bottleneck';

const MAX_CONCURRENT = 10;
const ITEMS_PER_PAGE = 500;

export default async function fetchAllPages(
  client,
  endpoint,
  params,
  perPage = ITEMS_PER_PAGE,
) {
  const limiter = new Bottleneck({
    maxConcurrent: MAX_CONCURRENT,
  });

  const baseResponse = await client.get(endpoint, {
    ...params,
    'page[limit]': perPage,
  });

  const totalCount = baseResponse.meta.total_count;

  const promises = [];

  for (let index = perPage; index < totalCount; index += perPage) {
    promises.push(
      limiter.schedule(async () => {
        const response = await client.get(endpoint, {
          ...params,
          'page[offset]': index,
          'page[limit]': perPage,
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
