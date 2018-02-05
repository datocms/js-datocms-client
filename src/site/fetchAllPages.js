function times(n) {
  /* eslint-disable prefer-spread */
  return Array.apply(null, { length: n }).map(Number.call, Number);
  /* eslint-enable prefer-spread */
}

export default function fetchAllPages(client, endpoint, params) {
  const itemsPerPage = 500;

  return client.get(
    endpoint,
    Object.assign({}, params, { 'page[limit]': itemsPerPage })
  )
  .then((baseResponse) => {
    const pages = Math.ceil(baseResponse.meta.totalCount / itemsPerPage);

    const extraFetches = times(pages - 1)
    .map((extraPage) => {
      return client.get(
        endpoint,
        Object.assign({}, params, {
          'page[offset]': itemsPerPage * (extraPage + 1),
          'page[limit]': itemsPerPage,
        })
      ).then(response => response.data);
    });

    return Promise.all(extraFetches).then(x => [x, baseResponse]);
  })
  .then(([datas, baseResponse]) => {
    return Object.assign(
      {}, baseResponse,
      {
        data: baseResponse.data.concat(...datas),
      }
    );
  });
}
