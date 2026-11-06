const Tour = require('../../models/tour.model');
const Category = require('../../models/category.model');
const City = require('../../models/province-city.model');

const moment = require('moment');

module.exports.detail = async (req, res) => {
  const slug = req.params.slug;

  const tourDetail = await Tour.findOne({
    slug: slug,
    deleted: false,
    status: "active"
  });

  if (!tourDetail) {
    res.redirect('/');
  }
  // Breadcrumb
  const breadcrumb = {
    image: '',
    title: '',
    list: [
      {
        link: '/',
        title: 'Trang chủ'
      }
    ]
  };

  // Tìm danh mục cha cấp 1
  const category = await Category.findOne({
    _id: tourDetail.category,
    deleted: false,
    status: 'active'
  });

  if(category && category.parent){
    const parentCategory = await Category.findOne({
      _id: category.parent,
      deleted: false,
      status: 'active'
    });

    breadcrumb.list.push({
      link: `/category/${parentCategory.slug}`,
      title: parentCategory.name
    });
  }

  if(category){
    breadcrumb.image = category.avatar;
    breadcrumb.title = category.name;
    breadcrumb.list.push({
      link: `/category/${category.slug}`,
      title: category.name
    });
  }

  breadcrumb.image = tourDetail.avatar;
  breadcrumb.title = tourDetail.name;
  breadcrumb.list.push({
    link: `/tour/detail/${tourDetail.slug}`,
    title: tourDetail.name
  });
  // End Breadcrumb

  // Thông tin chi tiết tour
  tourDetail.departureDateFormatted = moment(tourDetail.departureDate).format('DD/MM/YYYY');

  const cityList = await City.find({
    _id: { $in: tourDetail.locations }
  });
  // End Thông tin chi tiết tour

  res.render('client/pages/tour-detail', {
    pageTitle: 'Chi tiết tour',
    breadcrumb: breadcrumb,
    tourDetail: tourDetail,
    cityList: cityList
  });
}