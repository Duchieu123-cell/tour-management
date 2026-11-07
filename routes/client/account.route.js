const router = require('express').Router();
const multer = require('multer');

const accountController = require('../../controllers/client/account.controller');
const accountValidate = require('../../validates/client/account.validate');
const authMiddleware = require('../../middlewares/client/auth.middleware');
const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/login', accountController.login);
router.post('/login', accountValidate.loginPost, accountController.loginPost);

router.get('/register', accountController.register);
router.post('/register', accountValidate.registerPost, accountController.registerPost);

router.post('/logout', accountController.logoutPost);
router.post(
  '/change-password',
  authMiddleware.requireCustomerApi,
  accountValidate.changePassword,
  accountController.changePassword
);

// /account được mount trước requireCustomer nên route này phải tự chặn
router.get('/profile', authMiddleware.requireCustomer, accountController.profile);

module.exports = router;
