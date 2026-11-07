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

router.use(settingMiddleware.websiteInfo);
router.use(categoryMiddleware.list);
router.use(authMiddleware.optionalCustomer);

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