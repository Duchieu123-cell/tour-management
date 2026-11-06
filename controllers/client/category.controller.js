const moment = require('moment');
const Category = require('../../models/category.model');
const Tour = require('../../models/tour.model');
const City = require('../../models/province-city.model');

module.exports.list = async (req, res) => {
  const slug = req.params.slug;

  const category = await Category.findOne({
    slug: slug,
    deleted: false,
    status: 'active'
  });

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
  // End Breadcrumb

  const allCategoryChildren = [];

  const getCategoryChildren = async (parentId) => {
    const children = await Category.find({
      parent: parentId,
      deleted: false,
      status: 'active'
    });

    for(const child of children){
      allCategoryChildren.push(child._id);
      await getCategoryChildren(child._id);
    }
  }

  if(category){
    await getCategoryChildren(category._id);
  }

  const tourListSection9 = await Tour
    .find({
      category: { $in: [category._id, ...allCategoryChildren] },
      deleted: false,
      status: 'active'
    })
    .sort({
      position: "desc"
    })

  for (const item of tourListSection9) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }

  const cityList = await City.find({});

  res.render('client/pages/tour-list', { 
    pageTitle: "Danh sách tour",
    breadcrumb: breadcrumb,
    category: category,
    tourListSection9: tourListSection9,
    cityList: cityList
  });
}