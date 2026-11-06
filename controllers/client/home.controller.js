const moment = require('moment');
const Tour = require('../../models/tour.model');
const SettingWebsiteInfo = require('../../models/setting-website-info.model');
const Category = require('../../models/category.model');

module.exports.home = async (req, res) => {
  //Section 2
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  const clockExpire = settingWebsiteInfo ? settingWebsiteInfo.clockExpire : null;

  const tourListSection2 = await Tour
    .find({
      newPriceAdult: { $gt: 0 }, //Lọc các tour có giá lớn hơn 0
      deleted: false,
      status: 'active'
    })
    .sort({
      position: "desc"
    }) 
    .limit(6)

    for (const item of tourListSection2) {
      item.discount = Math.round(((item.priceAdult - item.newPriceAdult) / item.priceAdult) * 100);
      // Format lại ngày tháng năm
      item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');

    }
  //End Section 2

  // Section 4: Tour trong nước
  const categoryIdSection4 = "68cfb881bc7ca4013cc1c560";
  const listCategorySection4 = [categoryIdSection4];
  const listSubCatgorySection4 = await Category
    .find({ 
      parent: categoryIdSection4,
      deleted: false,
      status: 'active'
    })

  for (const item of listSubCatgorySection4) {
    listCategorySection4.push(item._id);
  }

  const tourListSection4 = await Tour
    .find({
      category: { $in: listCategorySection4 },
      deleted: false,
      status: 'active'
    })
    .sort({
      position: "desc"
    }) 
    .limit(8)

  for (const item of tourListSection4) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }
  // End Section 4

  // Section 6: Tour nước ngoài
  const categoryIdSection6 = "68d72bbaf8ba79a882b8fe72";
  const listCategorySection6 = [categoryIdSection6];
  const listSubCatgorySection6 = await Category
    .find({ 
      parent: categoryIdSection6,
      deleted: false,
      status: 'active'
    })

  for (const item of listSubCatgorySection6) {
    listCategorySection6.push(item._id);
  }

  const tourListSection6 = await Tour
    .find({
      category: { $in: listCategorySection6 },
      deleted: false,
      status: 'active'
    })
    .sort({
      position: "desc"
    }) 
    .limit(8)

  for (const item of tourListSection6) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }
  // End Section 4

  res.render('client/pages/home', {
    pageTitle: 'Trang chủ',
    clockExpire: clockExpire,
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    tourListSection6: tourListSection6
  });
}