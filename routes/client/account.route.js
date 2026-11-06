const router = require('express').Router();
const accountController = require('../../controllers/client/account.controller');
const accountValidate = require('../../validates/client/account.validate');

router.get('/login', accountController.login);
router.post('/login', accountValidate.loginPost, accountController.loginPost);

router.get('/register', accountController.register);
router.post('/register', accountValidate.registerPost, accountController.registerPost);

router.post('/logout', accountController.logoutPost);

module.exports = router;
