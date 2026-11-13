const Contact = require('../../models/contact.model');
const PaginationHelper = require('../../helpers/pagination.helper');
const FilterHelper = require('../../helpers/filter.helper');
const moment = require('moment');

module.exports.list = async (req, res) => {
  const find = {
    deleted: false
  };

  const createdAtRange = FilterHelper.buildDateRange(req.query.startDate, req.query.endDate);
  if (createdAtRange) {
    find.createdAt = createdAtRange;
  }

  const totalRecords = await Contact.countDocuments(find);
  const pagination = PaginationHelper.buildPagination(req.query.page, totalRecords, 10);

  const contactList = await Contact
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(pagination.limitItems)
    .skip(pagination.skip);

  for (const item of contactList) {
    item.createdAtFormatted = moment(item.createdAt).format('HH:mm - DD/MM/YYYY');
  }

  res.render('admin/pages/contact-list', {
    pageTitle: 'Thông tin liên hệ',
    contactList: contactList,
    pagination: pagination
  });
}