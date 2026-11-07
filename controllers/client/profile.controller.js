const Customer = require('../../models/customer.model');
const jwt = require('jsonwebtoken');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict'
};

// [GET] /profile
module.exports.detail = async (req, res) => {
  try {
    const customerId = res.locals.customer ? res.locals.customer.id : null;
    if (!customerId) {
      return res.status(401).json({
        code: 'ERROR',
        message: 'Vui lòng đăng nhập để thực hiện thao tác này'
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      status: 'active'
    }).select('_id fullName email phone avatar dob gender address createdAt updatedAt');

    if (!customer) {
      return res.status(404).json({
        code: 'ERROR',
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      code: 'SUCCESS',
      message: 'Lấy thông tin cá nhân thành công',
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      code: 'ERROR',
      message: error.message || 'Đã có lỗi xảy ra'
    });
  }
};

// [PATCH] /profile
module.exports.update = async (req, res) => {
  try {
    const customerId = res.locals.customer ? res.locals.customer.id : null;
    if (!customerId) {
      return res.status(401).json({
        code: 'ERROR',
        message: 'Vui lòng đăng nhập để thực hiện thao tác này'
      });
    }

    const updateData = {};

    if (req.body.fullName) {
      updateData.fullName = req.body.fullName.trim();
    }

    // Số điện thoại (chấp nhận phone hoặc phoneNumber từ form)
    const phoneInput = req.body.phone !== undefined ? req.body.phone : req.body.phoneNumber;
    if (phoneInput !== undefined) {
      updateData.phone = phoneInput.trim();
    }

    // Giới tính
    if (req.body.gender !== undefined) {
      updateData.gender = req.body.gender.trim();
    }

    // Địa chỉ (chấp nhận address hoặc city từ form)
    const addressInput = req.body.address !== undefined ? req.body.address : req.body.city;
    if (addressInput !== undefined) {
      updateData.address = addressInput.trim();
    }

    // Ngày sinh (chấp nhận dob dạng Date/ISO hoặc các trường riêng birthDay, birthMonth, birthYear)
    if (req.body.birthDay && req.body.birthMonth && req.body.birthYear) {
      const day = parseInt(req.body.birthDay, 10);
      const month = parseInt(req.body.birthMonth, 10);
      const year = parseInt(req.body.birthYear, 10);
      updateData.dob = new Date(Date.UTC(year, month - 1, day));
    } else if (req.body.dob !== undefined) {
      updateData.dob = req.body.dob ? new Date(req.body.dob) : null;
    }

    // Avatar (ưu tiên file upload qua Cloudinary, hoặc URL ảnh dạng chuỗi)
    if (req.file) {
      updateData.avatar = req.file.path;
    } else if (req.body.avatar !== undefined) {
      updateData.avatar = req.body.avatar;
    }

    // Kiểm tra trùng lặp email nếu có thay đổi email
    let emailChanged = false;
    if (req.body.email) {
      const newEmail = req.body.email.trim().toLowerCase();
      if (newEmail !== res.locals.customer.email) {
        const existingCustomer = await Customer.findOne({
          _id: { $ne: customerId },
          email: newEmail
        });

        if (existingCustomer) {
          return res.status(409).json({
            code: 'ERROR',
            message: 'Email đã được sử dụng bởi tài khoản khác'
          });
        }

        updateData.email = newEmail;
        emailChanged = true;
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    ).select('_id fullName email phone avatar dob gender address status createdAt updatedAt');

    if (!updatedCustomer) {
      return res.status(404).json({
        code: 'ERROR',
        message: 'Không tìm thấy thông tin tài khoản'
      });
    }

    // Cấp phát lại JWT token cookie nếu email thay đổi
    if (emailChanged) {
      const token = jwt.sign(
        {
          id: updatedCustomer.id,
          email: updatedCustomer.email
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d'
        }
      );

      res.cookie('customerToken', token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    // Cập nhật lại res.locals.customer và req.customer
    res.locals.customer = updatedCustomer;
    req.customer = updatedCustomer;

    res.json({
      code: 'SUCCESS',
      message: 'Cập nhật thông tin cá nhân thành công',
      data: updatedCustomer
    });
  } catch (error) {
    res.status(500).json({
      code: 'ERROR',
      message: error.message || 'Đã có lỗi xảy ra'
    });
  }
};
