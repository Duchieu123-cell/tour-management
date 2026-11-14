const moment = require('moment');
const Tour = require('../../models/tour.model');
const SettingWebsiteInfo = require('../../models/setting-website-info.model');
const Category = require('../../models/category.model');
const { getTodayStart } = require('../../helpers/tour-date.helper');

const CATEGORY_ID_SECTION_4 = '68cfb881bc7ca4013cc1c560';
const CATEGORY_ID_SECTION_6 = '68d72bbaf8ba79a882b8fe72';

const collectDirectCategoryIds = (categories, rootId) => {
  const ids = [rootId];
  for (const cat of categories) {
    if (String(cat.parent) === rootId) {
      ids.push(cat._id);
    }
  }
  return ids;
};

module.exports.home = async (req, res) => {
  const [websiteInfo, categories] = await Promise.all([
    res.locals?.websiteInfo !== undefined
      ? Promise.resolve(res.locals.websiteInfo)
      : SettingWebsiteInfo.findOne({}).lean(),
    Array.isArray(res.locals?.categoryList)
      ? Promise.resolve(res.locals.categoryList)
      : Category.find({ deleted: false, status: 'active' }).lean()
  ]);

  const clockExpire = websiteInfo ? websiteInfo.clockExpire : null;
  const listCategorySection4 = collectDirectCategoryIds(categories, CATEGORY_ID_SECTION_4);
  const listCategorySection6 = collectDirectCategoryIds(categories, CATEGORY_ID_SECTION_6);

  const [tourListSection2, tourListSection4, tourListSection6] = await Promise.all([
    Tour.find({
      newPriceAdult: { $gt: 0 },
      deleted: false,
      status: 'active',
      departureDate: { $gte: getTodayStart() }
    }).sort({ position: 'desc' }).limit(6).lean(),
    Tour.find({
      category: { $in: listCategorySection4 },
      deleted: false,
      status: 'active',
      departureDate: { $gte: getTodayStart() }
    }).sort({ position: 'desc' }).limit(8).lean(),
    Tour.find({
      category: { $in: listCategorySection6 },
      deleted: false,
      status: 'active',
      departureDate: { $gte: getTodayStart() }
    }).sort({ position: 'desc' }).limit(8).lean()
  ]);

  for (const item of tourListSection2) {
    item.discount = Math.round(((item.priceAdult - item.newPriceAdult) / item.priceAdult) * 100);
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }

  for (const item of tourListSection4) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }

  for (const item of tourListSection6) {
    item.departureDateFormatted = moment(item.departureDate).format('DD/MM/YYYY');
  }

  res.render('client/pages/home', {
    pageTitle: 'Trang chủ',
    clockExpire: clockExpire,
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    tourListSection6: tourListSection6
  });
};
