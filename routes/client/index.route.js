const router = require('express').Router();
const homeRoutes = require('./home.route');
const tourRoutes = require('./tour.route');
const cartRoutes = require('./cart.route');
const contactRoutes = require('./contact.route');
const categoryRoutes = require('./category.route');
const searchRoutes = require('./search.route');
const orderRoutes = require('./order.route');
const accountRoutes = require('./account.route');
const profileRoutes = require('./profile.route');

const settingMiddleware = require('../../middlewares/client/setting.middleware');
const categoryMiddleware = require('../../middlewares/client/category.middleware');
const authMiddleware = require('../../middlewares/client/auth.middleware');

const runMiddleware = (middleware, req, res) => new Promise((resolve, reject) => {
  middleware(req, res, (err) => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});

router.use(async (req, res, next) => {
  try {
    await Promise.all([
      runMiddleware(settingMiddleware.websiteInfo, req, res),
      runMiddleware(categoryMiddleware.list, req, res),
      runMiddleware(authMiddleware.optionalCustomer, req, res)
    ]);
    return next();
  } catch (error) {
    return next(error);
  }
});

router.use('/account', accountRoutes);
router.use(authMiddleware.requireCustomer);

router.use('/', homeRoutes);
router.use('/tour', tourRoutes);
router.use('/cart', cartRoutes);
router.use('/contact', contactRoutes);
router.use('/category', categoryRoutes);
router.use('/search', searchRoutes);
router.use('/order', orderRoutes);
router.use('/profile', profileRoutes);

module.exports = router;
