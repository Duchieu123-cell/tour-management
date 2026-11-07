const bcrypt = require('bcryptjs');
const Customer = require('../../models/customer.model');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict'
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const currentCustomer = res.locals.customer;
    if (!currentCustomer) {
      return res.status(401).json({
        code: 'ERROR',
        message: 'Vui lòng đăng nhập để thực hiện thao tác này'
      });
    }

    const customer = await Customer.findOne({
      _id: currentCustomer._id,
      status: 'active',
      deleted: { $ne: true }
    });

    if (!customer) {
      res.clearCookie('customerToken', cookieOptions);
      return res.status(404).json({
        code: 'ERROR',
        message: 'Tài khoản không tồn tại hoặc đã bị xóa'
      });
    }

    if (typeof req.body?.password === 'string' && req.body.password.length > 0) {
      const isPasswordValid = await bcrypt.compare(req.body.password, customer.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          code: 'ERROR',
          message: 'Mật khẩu xác nhận không đúng'
        });
      }
    }

    await Customer.updateOne(
      {
        _id: customer._id,
        deleted: { $ne: true }
      },
      {
        status: 'inactive',
        deleted: true,
        deletedAt: new Date()
      }
    );

    res.clearCookie('customerToken', cookieOptions);

    return res.json({
      code: 'SUCCESS',
      message: 'Xóa tài khoản thành công'
    });
  } catch (error) {
    return res.status(500).json({
      code: 'ERROR',
      message: 'Không thể xóa tài khoản lúc này'
    });
  }
};
