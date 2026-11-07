const router = require('express').Router();
const multer = require('multer');
const userController = require('../../controllers/admin/user.controller');
const userValidate = require('../../validates/admin/user.validate');
const cloudinaryHelper = require('../../helpers/cloudinary.helper');

const upload = multer({ storage: cloudinaryHelper.storage });

// [GET] Danh sách người dùng
router.get('/list', userController.list);

// [GET] Chi tiết người dùng theo ID
router.get('/detail/:id', userController.detail);

// [POST] Tạo mới người dùng
router.post('/create', upload.single('avatar'), userValidate.createPost, userController.createPost);

// [PATCH] Cập nhật thông tin người dùng
router.patch('/edit/:id', upload.single('avatar'), userValidate.editPatch, userController.editPatch);

// [PATCH] Đổi trạng thái nhanh
router.patch('/change-status/:status/:id', userController.changeStatusPatch);

// [PATCH] Thay đổi trạng thái / xóa nhiều người dùng
router.patch('/change-multi', userController.changeMultiPatch);

// [PATCH] Xóa mềm người dùng
router.patch('/delete/:id', userController.deletePatch);

// [PATCH] Khôi phục người dùng đã xóa mềm
router.patch('/undo/:id', userController.undoPatch);

// [DELETE] Xóa vĩnh viễn người dùng
router.delete('/destroy/:id', userController.destroyDelete);

module.exports = router;
