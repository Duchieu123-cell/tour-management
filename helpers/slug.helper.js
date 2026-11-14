const slugifyVietnamese = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  // The Vietnamese letter đ does not decompose with NFD.
  .replace(/[đĐ]/g, 'd')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

module.exports = {
  slugifyVietnamese
};
