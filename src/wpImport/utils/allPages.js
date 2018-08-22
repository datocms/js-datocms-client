const { spin, progress } = require('../utils/progress');

const allPages = async (label, requestPromise, tick = null, page = 0) => {
  const response = await (
    tick
      ? tick('', requestPromise)
      : spin(label, requestPromise)
  );

  if (!response.paging || !response.paging.next) {
    return response;
  }

  return response.concat(
    await allPages(
      label,
      response.paging.next,
      tick || progress(label, response.paging.totalPages - 1),
      page + 1,
    ),
  );
};

module.exports = allPages;
