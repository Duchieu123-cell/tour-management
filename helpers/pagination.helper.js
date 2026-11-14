/**
 * Build normalized pagination metadata for admin list queries.
 */
module.exports.buildPagination = (queryPage, totalRecords, limitItems = 10) => {
  const totalPages = Math.max(1, Math.ceil(totalRecords / limitItems));
  let currentPage = parseInt(queryPage, 10);

  if (Number.isNaN(currentPage) || currentPage < 1) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  return {
    totalRecords,
    totalPages,
    currentPage,
    limitItems,
    skip: (currentPage - 1) * limitItems,
  };
};
