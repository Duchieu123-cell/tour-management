const SettingWebsiteInfo = require('../../models/setting-website-info.model');

const CACHE_TTL_MS = 30 * 1000;
let cachedWebsiteInfo = null;
let cachedAt = 0;

module.exports.websiteInfo = async (req, res, next) => {
  const now = Date.now();
  if (!cachedWebsiteInfo || now - cachedAt > CACHE_TTL_MS) {
    cachedWebsiteInfo = await SettingWebsiteInfo.findOne({}).lean();
    cachedAt = now;
  }

  res.locals.websiteInfo = cachedWebsiteInfo;

  next();
};
