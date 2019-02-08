/* eslint-disable */

const { spin, progress } = require('../utils/progress');

const allPages = async (label, requestPromise, tick = null, page = 1) => {
  const response = await (
    tick
      ? tick('', requestPromise)
      : spin(label, requestPromise)
  );

  if (!response._paging || response._paging.totalPages <= page) {
    return response;
  }

  const nextPage = response._paging.next.page(page + 1);
  return response.concat(
    await allPages(
      label,
      nextPage,
      tick || progress(label, response._paging.totalPages - 1),
      page + 1,
    ),
  );
};

module.exports = allPages;
