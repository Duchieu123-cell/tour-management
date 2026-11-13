const moment = require('moment');
const Category = require('../../models/category.model');
const Tour = require('../../models/tour.model');
const City = require('../../models/province-city.model');
const PaginationHelper = require('../../helpers/pagination.helper');

const collectDescendantIds = (categories, rootId) => {
  const childrenByParent = new Map();
  for (const cat of categories) {
    const parentKey = cat.parent ? String(cat.parent) : '';
    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }
    childrenByParent.get(parentKey).push(cat._id);
  }

  const descendants = [];
  const stack = [String(rootId)];
  while (stack.length > 0) {
    const currentId = stack.pop();
    const children = childrenByParent.get(currentId) || [];
    for (const childId of children) {
      descendants.push(childId);
      stack.push(String(childId));
    }
  }
  return descendants;
};

module.exports.list = async (req, res) => {
  const slug = req.params.slug;

  const categories = Array.isArray(res.locals?.categoryList)
    ? res.locals.categoryList
    : await Category.find({ deleted: false, status: 'active' }).lean();

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return res.redirect('/');
  }

  // Breadcrumb
  const breadcrumb = {
    image: category.avatar || '',
    title: category.name || '',
    list: [
      {
        link: '/',
        title: 'Trang chủ'
      }
    ]
  };

  if (category.parent) {
    const parentCategory = categories.find((item) => String(item._id) === String(category.parent));
    if (parentCategory) {
      breadcrumb.list.push({
        link: `/category/${parentCategory.slug}`,
        title: parentCategory.name
      });
    }
  }

  breadcrumb.list.push({
    link: `/category/${category.slug}`,
    title: category.name
  });
  // End Breadcrumb

  const allCategoryChildren = collectDescendantIds(categories, category._id);

  const find = {
    category: { $in: [category._id, ...allCategoryChildren] },
    deleted: false,
    status: 'active'
  };

  const requestedPage = parseInt(req.query.page, 10);
  const isFirstPage = Number.isNaN(requestedPage) || requestedPage <= 1;

  let totalRecords;
  let pagination;
  let tourListSection9;
  let cityList;

  if (isFirstPage) {
    [totalRecords, tourListSection9, cityList] = await Promise.all([
      Tour.countDocuments(find),
      Tour.find(find).sort({ position: 'desc' }).limit(9).lean(),
      City.find({}).lean()
    ]);
    pagination = PaginationHelper.buildPagination(req.query.page, totalRecords, 9);
  } else {
    [totalRecords, cityList] = await Promise.all([
      Tour.countDocuments(find),
      City.find({}).lean()
    ]);
    pagination = PaginationHelper.buildPagination(req.query.page, totalRecords, 9);
    tourListSection9 = await Tour
      .find(find)
      .sort({ position: 'desc' })
      .limit(pagination.limitItems)
      .skip(pagination.skip)
      .lean();
  }

  for (const item of tourListSection9) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }

  res.render('client/pages/tour-list', {
    pageTitle: category.name || 'Danh sách tour',
    breadcrumb: breadcrumb,
    category: category,
    tourListSection9: tourListSection9,
    cityList: cityList,
    pagination: pagination
  });
};
