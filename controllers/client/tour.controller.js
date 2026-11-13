const moment = require('moment');
const Tour = require('../../models/tour.model');
const Category = require('../../models/category.model');
const City = require('../../models/province-city.model');

module.exports.detail = async (req, res) => {
  const slug = req.params.slug;

  const tourDetail = await Tour.findOne({
    slug: slug,
    deleted: false,
    status: 'active'
  }).lean();

  if (!tourDetail) {
    return res.redirect('/');
  }

  tourDetail.id = String(tourDetail._id);
  tourDetail.departureDateFormatted = moment(tourDetail.departureDate).format('DD/MM/YYYY');

  const [categories, cityList] = await Promise.all([
    Array.isArray(res.locals?.categoryList)
      ? Promise.resolve(res.locals.categoryList)
      : Category.find({ deleted: false, status: 'active' }).lean(),
    City.find({ _id: { $in: tourDetail.locations } }).lean()
  ]);

  const breadcrumb = {
    image: tourDetail.avatar || '',
    title: tourDetail.name || '',
    list: [
      {
        link: '/',
        title: 'Trang chủ'
      }
    ]
  };

  const category = categories.find((item) => String(item._id) === String(tourDetail.category));
  if (category && category.parent) {
    const parentCategory = categories.find((item) => String(item._id) === String(category.parent));
    if (parentCategory) {
      breadcrumb.list.push({
        link: `/category/${parentCategory.slug}`,
        title: parentCategory.name
      });
    }
  }

  if (category) {
    breadcrumb.list.push({
      link: `/category/${category.slug}`,
      title: category.name
    });
  }

  breadcrumb.list.push({
    link: `/tour/detail/${tourDetail.slug}`,
    title: tourDetail.name
  });

  res.render('client/pages/tour-detail', {
    pageTitle: tourDetail.name || 'Chi tiết tour',
    breadcrumb: breadcrumb,
    tourDetail: tourDetail,
    cityList: cityList
  });
};
