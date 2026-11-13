const Category = require('../../models/category.model');
const categoryHelper = require('../../helpers/category.helper');

const CACHE_TTL_MS = 30 * 1000;
let cachedCategoryList = null;
let cachedCategoryTree = null;
let cachedAt = 0;

module.exports.list = async (req, res, next) => {
  const now = Date.now();
  if (!cachedCategoryList || !cachedCategoryTree || now - cachedAt > CACHE_TTL_MS) {
    cachedCategoryList = await Category.find({
      deleted: false,
      status: 'active'
    }).lean();
    cachedCategoryTree = categoryHelper.buildCategoryTree(cachedCategoryList);
    cachedAt = now;
  }

  res.locals.categoryList = cachedCategoryList;
  res.locals.categoryTree = cachedCategoryTree;

  next();
};
