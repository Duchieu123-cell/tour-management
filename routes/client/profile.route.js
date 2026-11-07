const router = require('express').Router();
const multer = require('multer');

const profileController = require('../../controllers/client/profile.controller');
const profileValidate = require('../../validates/client/profile.validate');
const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

// Lấy thông tin tài khoản hiện tại
router.get('/', profileController.detail);

// Cập nhật thông tin profile
router.patch(
  '/', 
  upload.single('avatar'), 
  profileValidate.updateProfile, 
  profileController.update
);

module.exports = router;
