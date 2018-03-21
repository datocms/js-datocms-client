function times(n) {
  /* eslint-disable prefer-spread */
  return Array.apply(null, { length: n }).map(Number.call, Number);
  /* eslint-enable prefer-spread */
}

function seq(promises) {
  return new Promise((resolve, reject) => {
    let count = 0;
    let results = [];

    const iterateeFunc = (previousPromise, currentPromise) => {
      return previousPromise
        .then((result) => {
          if (count !== 0) results = results.concat(result);
          count += 1;
          return currentPromise(result, results, count);
        })
        .catch((err) => {
          return reject(err);
        });
    };

    const allPromises = promises.concat(() => Promise.resolve());

    allPromises.reduce(iterateeFunc, Promise.resolve(false))
    .then(() => {
      resolve(results);
    });
  });
}

export default function fetchAllPages(client, endpoint, params) {
  const itemsPerPage = 100;

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

    return seq(extraFetches).then(x => [x, baseResponse]);
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
