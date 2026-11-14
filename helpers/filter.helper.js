const moment = require('moment');

/**
 * Build a MongoDB date range filter for `createdAt` from YYYY-MM-DD query strings.
 */
module.exports.buildDateRange = (startDateStr, endDateStr) => {
  const dateFilter = {};

  if (startDateStr) {
    const start = moment(startDateStr);
    if (start.isValid()) {
      dateFilter.$gte = start.startOf('day').toDate();
    }
  }

  if (endDateStr) {
    const end = moment(endDateStr);
    if (end.isValid()) {
      dateFilter.$lte = end.endOf('day').toDate();
    }
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};
