const moment = require('moment');
const bcrypt = require('bcryptjs');
const Customer = require('../../models/customer.model');

// [GET] /admin/user/list
module.exports.list = async (req, res) => {
  try {
    const find = {
      deleted: false
    };

    // Lọc theo trạng thái
    if (req.query.status) {
      find.status = req.query.status;
    }

    // Lọc theo khoảng ngày tạo
    const dateFilter = {};
    if (req.query.startDate) {
      dateFilter.$gte = moment(req.query.startDate).startOf('day').toDate();
    }
    if (req.query.endDate) {
      dateFilter.$lte = moment(req.query.endDate).endOf('day').toDate();
    }
    if (Object.keys(dateFilter).length > 0) {
      find.createdAt = dateFilter;
    }

    // Tìm kiếm theo Họ tên, Email, Số điện thoại
    if (req.query.keyword) {
      const keywordRegex = new RegExp(req.query.keyword.trim(), 'i');
      find.$or = [
        { fullName: keywordRegex },
        { email: keywordRegex },
        { phone: keywordRegex }
      ];
    }

    // Phân trang
    const limitItems = parseInt(req.query.limit) || 10;
    let page = 1;
    if (req.query.page) {
      const currentPage = parseInt(req.query.page);
      page = currentPage > 0 ? currentPage : 1;
    }

    const totalRecords = await Customer.countDocuments(find);
    const totalPages = Math.ceil(totalRecords / limitItems) || 1;
    const skip = (page - 1) * limitItems;

    const pagination = {
      totalRecords: totalRecords,
      totalPages: totalPages,
      skip: skip,
      limitItems: limitItems,
      page: page
    };

    // Sắp xếp
    let sort = { createdAt: 'desc' };
    if (req.query.sortKey && req.query.sortValue) {
      sort = { [req.query.sortKey]: req.query.sortValue };
    }

    const userList = await Customer
      .find(find)
      .select('-password')
      .sort(sort)
      .limit(limitItems)
      .skip(skip);

    // Format ngày hiển thị
    const formattedUserList = userList.map(user => {
      const u = user.toObject();
      u.createdAtFormatted = moment(u.createdAt).format('HH:mm - DD/MM/YYYY');
      if (u.dob) {
        u.dobFormatted = moment(u.dob).format('DD/MM/YYYY');
      }
      return u;
    });

    // Nếu client yêu cầu JSON API (hoặc gắn param ?format=json)
    if (req.query.format === 'json' || req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        code: 'SUCCESS',
        pagination: pagination,
        data: formattedUserList
      });
    }

    // Render Pug View
    res.render('admin/pages/user-list', {
      pageTitle: 'Quản lý người dùng',
      userList: formattedUserList,
      pagination: pagination
    });
  } catch (error) {
    console.error(error);
    if (req.query.format === 'json' || req.xhr) {
      return res.json({ code: 'ERROR', message: error.message });
    }
    res.redirect(`/${global.pathAdmin}/dashboard`);
  }
};

// [GET] /admin/user/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Customer.findOne({ _id: id, deleted: false }).select('-password');

    if (!user) {
      return res.json({ code: 'ERROR', message: 'Người dùng không tồn tại' });
    }

    res.json({
      code: 'SUCCESS',
      data: user
    });
  } catch (error) {
    res.json({ code: 'ERROR', message: error.message });
  }
};

// [POST] /admin/user/create
module.exports.createPost = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existEmail = await Customer.findOne({
      email: email.toLowerCase().trim(),
      deleted: false
    });

    if (existEmail) {
      return res.json({
        code: 'ERROR',
        message: 'Email này đã tồn tại trong hệ thống'
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
    req.body.email = email.toLowerCase().trim();

    if (req.file) {
      req.body.avatar = req.file.path;
    }

    const newUser = new Customer(req.body);
    await newUser.save();

    const userData = newUser.toObject();
    delete userData.password;

    req.flash('success', 'Tạo tài khoản người dùng thành công');

    res.json({
      code: 'SUCCESS',
      message: 'Tạo tài khoản người dùng thành công',
      data: userData
    });
  } catch (error) {
    res.json({
      code: 'ERROR',
      message: error.message
    });
  }
};

// [PATCH] /admin/user/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    const { id } = req.params;

    const existUser = await Customer.findOne({ _id: id, deleted: false });
    if (!existUser) {
      return res.json({ code: 'ERROR', message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra trùng email với user khác
    if (req.body.email) {
      const email = req.body.email.toLowerCase().trim();
      const duplicateEmail = await Customer.findOne({
        _id: { $ne: id },
        email: email,
        deleted: false
      });
      if (duplicateEmail) {
        return res.json({ code: 'ERROR', message: 'Email đã được sử dụng bởi người dùng khác' });
      }
      req.body.email = email;
    }

    // Nếu đổi mật khẩu
    if (req.body.password && req.body.password.trim() !== '') {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete req.body.password;
    }

    // Nếu upload avatar mới
    if (req.file) {
      req.body.avatar = req.file.path;
    }

    await Customer.updateOne({ _id: id, deleted: false }, req.body);

    req.flash('success', 'Cập nhật thông tin người dùng thành công');

    res.json({
      code: 'SUCCESS',
      message: 'Cập nhật thông tin người dùng thành công'
    });
  } catch (error) {
    res.json({
      code: 'ERROR',
      message: error.message
    });
  }
};

// [PATCH] /admin/user/change-status/:status/:id
module.exports.changeStatusPatch = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!['active', 'inactive'].includes(status)) {
      return res.json({ code: 'ERROR', message: 'Trạng thái không hợp lệ' });
    }

    await Customer.updateOne({ _id: id }, { status: status });

    req.flash('success', 'Cập nhật trạng thái thành công');

    res.json({
      code: 'SUCCESS',
      message: 'Cập nhật trạng thái thành công'
    });
  } catch (error) {
    res.json({ code: 'ERROR', message: error.message });
  }
};

// [PATCH] /admin/user/change-multi
module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.json({ code: 'ERROR', message: 'Vui lòng chọn ít nhất 1 người dùng' });
    }

    if (option === 'active' || option === 'inactive') {
      await Customer.updateMany({ _id: { $in: ids } }, { status: option });
      req.flash('success', 'Đổi trạng thái thành công');
      return res.json({ code: 'SUCCESS', message: 'Đổi trạng thái thành công' });
    }

    if (option === 'delete') {
      await Customer.updateMany(
        { _id: { $in: ids } },
        { deleted: true, deletedAt: new Date() }
      );
      req.flash('success', 'Xóa thành công');
      return res.json({ code: 'SUCCESS', message: 'Xóa thành công' });
    }

    res.json({ code: 'ERROR', message: 'Hành động không hợp lệ' });
  } catch (error) {
    res.json({ code: 'ERROR', message: error.message });
  }
};

// [PATCH] /admin/user/delete/:id (Soft delete)
module.exports.deletePatch = async (req, res) => {
  try {
    const { id } = req.params;

    await Customer.updateOne(
      { _id: id },
      { deleted: true, deletedAt: new Date() }
    );

    req.flash('success', 'Xóa người dùng thành công');

    res.json({
      code: 'SUCCESS',
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    res.json({ code: 'ERROR', message: error.message });
  }
};

// [PATCH] /admin/user/undo/:id (Restore)
module.exports.undoPatch = async (req, res) => {
  try {
    const { id } = req.params;

    await Customer.updateOne(
      { _id: id },
      { deleted: false, deletedAt: null }
    );

    req.flash('success', 'Khôi phục người dùng thành công');

    res.json({
      code: 'SUCCESS',
      message: 'Khôi phục người dùng thành công'
    });
  } catch (error) {
    res.json({ code: 'ERROR', message: error.message });
  }
};
