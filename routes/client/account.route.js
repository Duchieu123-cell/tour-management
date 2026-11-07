const router = require('express').Router();
const accountController = require('../../controllers/client/account.controller');
const accountValidate = require('../../validates/client/account.validate');
const authMiddleware = require('../../middlewares/client/auth.middleware');

router.get('/login', accountController.login);
router.post('/login', accountValidate.loginPost, accountController.loginPost);

router.get('/register', accountController.register);
router.post('/register', accountValidate.registerPost, accountController.registerPost);

router.post('/logout', accountController.logoutPost);

// /account được mount trước requireCustomer nên route này phải tự chặn
router.get('/profile', authMiddleware.requireCustomer, accountController.profile);

module.exports = router;
