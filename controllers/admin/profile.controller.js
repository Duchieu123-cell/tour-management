const bcrypt = require('bcryptjs');
const AccountAdmin = require('../../models/accounts-admin.model');
const Role = require('../../models/role.model');

module.exports.edit = async (req, res) => {
  const profileDetail = await AccountAdmin.findOne({
    _id: req.account.id
  });

  if (profileDetail) {
    const roleDetail = await Role.findOne({
      _id: profileDetail.role
    });

    profileDetail.roleName = roleDetail.name;
  }

  console.log(profileDetail);

  res.render('admin/pages/profile-edit', {
    pageTitle: 'Thông tin cá nhân',
    profileDetail: profileDetail
  });
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.account.id;
    req.body.updatedBy = req.account.id;

    if (req.file){
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    await AccountAdmin.updateOne({
      _id: id
    }, req.body);

    req.flash('success', 'Cập nhật thông tin cá nhân thành công');

    res.json({
      code: "SUCCESS"
    });
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error.message
    });
  }
}

module.exports.changePassword = async (req, res) => {
  res.render('admin/pages/profile-change-password', {
    pageTitle: 'Đổi mật khẩu'
  });
}

module.exports.changePasswordPatch = async (req, res) => {
  try {
    const id = req.account.id;
    req.body.updatedBy = req.account.id;

    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    
    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    req.flash('success', 'Đổi mật khẩu thành công');

    res.json({
      code: "SUCCESS"
    });
  } catch (error) {
    res.json({
      code: "ERROR",
      message: error
    });
  }
}