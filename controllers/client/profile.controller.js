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
    }).select('_id fullName email phone avatar createdAt');

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

    if (req.body.phone !== undefined) {
      updateData.phone = req.body.phone.trim();
    }

    // Xử lý avatar: ưu tiên file upload qua Cloudinary, hoặc URL truyền trong body
    if (req.file) {
      updateData.avatar = req.file.path;
    } else if (req.body.avatar !== undefined) {
      updateData.avatar = req.body.avatar;
    }

    // Nếu có đổi email, kiểm tra trùng lặp với tài khoản khác
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
    ).select('_id fullName email phone avatar status');

    if (!updatedCustomer) {
      return res.status(404).json({
        code: 'ERROR',
        message: 'Không tìm thấy thông tin tài khoản'
      });
    }

    // Nếu email thay đổi, cập nhật lại JWT token cookie để không bị gián đoạn phiên
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

    // Cập nhật lại res.locals.customer
    res.locals.customer = updatedCustomer;

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
