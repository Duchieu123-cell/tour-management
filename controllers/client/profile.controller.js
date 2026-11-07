const bcrypt = require('bcryptjs');
const moment = require('moment');
const Customer = require('../../models/customer.model');
const Order = require('../../models/order.model');

// [GET] /profile
module.exports.getProfile = async (req, res) => {
  try {
    const customerId = res.locals.customer?.id || res.locals.customer?._id;

    if (!customerId) {
      return res.status(401).json({
        code: 'ERROR',
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      status: 'active'
    }).select('-password');

    if (!customer) {
      return res.status(404).json({
        code: 'ERROR',
        message: 'Tài khoản không tồn tại hoặc đã bị khóa'
      });
    }

    res.json({
      code: 'SUCCESS',
      message: 'Lấy thông tin profile thành công',
      profile: customer
    });
  } catch (error) {
    res.status(500).json({
      code: 'ERROR',
      message: 'Lỗi máy chủ khi lấy thông tin profile',
      error: error.message
    });
  }
};


