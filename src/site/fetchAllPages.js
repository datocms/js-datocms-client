function times(n) {
  /* eslint-disable prefer-spread */
  return Array.apply(null, { length: n }).map(Number.call, Number);
  /* eslint-enable prefer-spread */
}

export default function fetchAllPages(client, endpoint, params) {
  const itemsPerPage = 100;

  return client.get(
    endpoint,
    Object.assign({}, params, { 'page[limit]': itemsPerPage })
  )
  .then((baseResponse) => {
    const pages = Math.ceil(baseResponse.meta.totalCount / itemsPerPage);

    return times(pages - 1).reduce((chain, extraPage) => {
      return chain.then((result) => {
        return client.get(
          endpoint,
          Object.assign({}, params, {
            'page[offset]': itemsPerPage * (extraPage + 1),
            'page[limit]': itemsPerPage,
          })
        ).then(response => result.concat(response.data));
      });
    }, Promise.resolve(baseResponse.data))
    .then((data) => {
      return Object.assign({}, baseResponse, { data });
    });
  });
}
