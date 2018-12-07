const { spin, progress } = require('../utils/progress');

const allPages = async (label, requestPromise, tick = null, page = 0) => {
  const response = await (
    tick
      ? tick('', requestPromise)
      : spin(label, requestPromise)
  );

  if (!response._paging || !response._paging.next) {
    return response;
  }

  return response.concat(
    await allPages(
      label,
      response._paging.next,
      tick || progress(label, response._paging.totalPages - 1),
      page + 1,
    ),
  );
};

module.exports = allPages;
