const router = require('express').Router();
const multer = require('multer');

const profileController = require('../../controllers/client/profile.controller');
const profileValidate = require('../../validates/client/profile.validate');
const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

// Lấy thông tin tài khoản hiện tại
router.get('/', profileController.detail);

// Cập nhật thông tin profile
router.patch('/', upload.single('avatar'), profileValidate.updateProfile, profileController.update);

// Xóa tài khoản (Soft delete)
router.delete('/delete', profileController.deleteAccount);
router.patch('/delete', profileController.deleteAccount);
router.post('/delete', profileController.deleteAccount);
router.delete('/', profileController.deleteAccount);

module.exports = router;
