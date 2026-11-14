const getTodayStart = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  // Tour departure dates are date-only values stored at UTC midnight.
  return new Date(`${dateParts.year}-${dateParts.month}-${dateParts.day}T00:00:00.000Z`);
};

module.exports = { getTodayStart };
