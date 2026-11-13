const SettingWebsiteInfo = require('../../models/setting-website-info.model');
const Role = require('../../models/role.model');
const AccountAdmin = require('../../models/accounts-admin.model');

const permissionConfig = require('../../config/permission');
const PaginationHelper = require('../../helpers/pagination.helper');
const FilterHelper = require('../../helpers/filter.helper');

const bcrypt = require('bcryptjs');

module.exports.list = async (req, res) => {
  res.render('admin/pages/setting-list', {
    pageTitle: 'Cài đặt chung'
  });
}

module.exports.websiteInfo = async (req, res) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

  console.log(settingWebsiteInfo);

  res.render('admin/pages/setting-website-info', {
    pageTitle: 'Thông tin website',
    settingWebsiteInfo: settingWebsiteInfo
  });
}

module.exports.websiteInfoPatch = async (req, res) => {
  if(Object.keys(req.files).length > 0) {
    if(req.files.logo) {
      req.body.logo = req.files.logo[0].path;
    } else {
      delete req.body.logo;
    }

    if(req.files.favicon) {
      req.body.favicon = req.files.favicon[0].path;
    } else {
      delete req.body.favicon;
    }
  } else {
    delete req.body.logo;
    delete req.body.favicon;
  }

  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});

  if(!settingWebsiteInfo) {
    const newRecord = new SettingWebsiteInfo(req.body);
    await newRecord.save();
  } else {
    await SettingWebsiteInfo.updateOne({_id: settingWebsiteInfo._id}, req.body);
  }

  req.flash('success', 'Cập nhật thông tin website thành công');

  res.json({
    code: "SUCCESS",
  });
}

module.exports.accountAdminList = async (req, res) => {
  const find = {
    deleted: false
  };

  if (req.query.status) {
    find.status = req.query.status;
  }

  const createdAtRange = FilterHelper.buildDateRange(req.query.startDate, req.query.endDate);
  if (createdAtRange) {
    find.createdAt = createdAtRange;
  }

  const totalRecords = await AccountAdmin.countDocuments(find);
  const pagination = PaginationHelper.buildPagination(req.query.page, totalRecords, 10);

  const accountAdminList = await AccountAdmin
    .find(find)
    .sort({
      createdAt: "desc"
    })
    .limit(pagination.limitItems)
    .skip(pagination.skip);

  for(const item of accountAdminList) {
    if(item.role){
      const roleDetail = await Role.findOne({
        _id: item.role,
        deleted: false
      });

      if(roleDetail) {
        item.roleName = roleDetail.name;
      }
    }
  }

  res.render('admin/pages/setting-account-admin-list', {
    pageTitle: 'Tài khoản quản trị',
    accountAdminList: accountAdminList,
    pagination: pagination
  });
}

module.exports.accountAdminCreate = async (req, res) => {
  const roleList = await Role.find({
    deleted: false
  }); 

  res.render('admin/pages/setting-account-admin-create', {
    pageTitle: 'Tạo tài khoản quản trị',
    roleList: roleList
  });
}

module.exports.accountAdminCreatePost = async (req, res) => {
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;
  if(req.file) {
    req.body.avatar = req.file.path;
  }

  const existingAccount = await AccountAdmin.findOne({
    email: req.body.email,
    deleted: false
  });

  if(existingAccount) {
    return res.json({
      code: "ERROR",
      message: "Email đã được sử dụng, vui lòng sử dụng email khác"
    });
  }

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  req.body.password = hashedPassword;

  const newRecord = new AccountAdmin(req.body);
  await newRecord.save();
  
  req.flash('success', 'Tạo tài khoản quản trị thành công');

  res.json({
    code: "SUCCESS",
  });
}

module.exports.accountAdminEdit = async (req, res) => {
  try {
    const roleList = await Role.find({
      deleted: false
    });

    const id = req.params.id;
    const accountAdminDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false
    });

    res.render('admin/pages/setting-account-admin-edit', {
      pageTitle: 'Chỉnh sửa tài khoản quản trị',
      roleList: roleList,
      accountAdminDetail: accountAdminDetail
    });

  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
}

module.exports.accountAdminEditPatch = async (req, res) => {
  try {
    const id = req.params.id;

    req.body.updatedBy = req.account.id;

    if(req.file) {
      req.body.avatar = req.file.path;
    }
    if(req.body.password) {
      // Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPassword;
    } else {
      delete req.body.password;
    }
    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, req.body);
    
    req.flash('success', 'Cập nhật tài khoản quản trị thành công');
    
    res.json({
      code: "SUCCESS",
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
}

module.exports.roleList = async (req, res) => {
  const roleList = await Role.find({
    deleted: false
  });

  console.log(roleList);

  res.render('admin/pages/setting-role-list', {
    pageTitle: 'Nhóm quyền',
    roleList: roleList
  });
}

module.exports.roleCreate = async (req, res) => {
  res.render('admin/pages/setting-role-create', {
    pageTitle: 'Tạo nhóm quyền',
    permissionList: permissionConfig.permissionList,
  });
}

module.exports.roleCreatePost = async (req, res) => {
  req.body.createdBy = req.account.id;
  req.body.updatedBy = req.account.id;

  const newRecord = new Role(req.body);
  await newRecord.save();

  req.flash('success', 'Tạo nhóm quyền thành công');

  res.json({
    code: "SUCCESS",
  });
}

module.exports.roleEdit = async (req, res) => {
  try {
    const id = req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false
    });

    res.render('admin/pages/setting-role-edit', {
      pageTitle: 'Chỉnh sửa nhóm quyền',
      permissionList: permissionConfig.permissionList,
      roleDetail: roleDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/role/list`);
  }
}

module.exports.roleEditPatch = async (req, res) => {
  try {
    const id = req.params.id;

    await Role.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    req.flash('success', 'Cập nhật nhóm quyền thành công');
    
    res.json({
      code: "SUCCESS",
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/role/list`);
  }
}