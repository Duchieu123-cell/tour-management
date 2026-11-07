const router = require('express').Router();
const multer = require('multer');

const profileController = require('../../controllers/client/profile.controller');
const profileValidate = require('../../validates/client/profile.validate');
const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

// [GET] /profile
router.get('/', profileController.getProfile);


module.exports = router;
