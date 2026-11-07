const jwt = require('jsonwebtoken');
const Customer = require('../../models/customer.model');

module.exports.optionalCustomer = async (req, res, next) => {
  res.locals.customer = null;

  let token = req.cookies.customerToken;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.clearCookie('customerToken', {
      httpOnly: true,
      sameSite: 'strict'
    });
    return next();
  }

  const customer = await Customer.findOne({
    _id: decoded.id,
    email: decoded.email,
    status: 'active',
    deleted: { $ne: true }
  }).select('_id fullName email avatar');

  if (!customer) {
    res.clearCookie('customerToken', {
      httpOnly: true,
      sameSite: 'strict'
    });
    return next();
  }

  res.locals.customer = customer;
  next();
};

module.exports.requireCustomer = (req, res, next) => {
  if (!res.locals.customer) {
    if (req.xhr || req.headers.accept?.includes('application/json') || req.baseUrl === '/profile') {
      return res.status(401).json({
        code: 'ERROR',
        message: 'Vui lòng đăng nhập để tiếp tục'
      });
    }
    return res.redirect('/account/login');
  }

  next();
};

module.exports.requireCustomerApi = (req, res, next) => {
  if (!res.locals.customer) {
    return res.status(401).json({
      code: 'ERROR',
      message: 'Vui lòng đăng nhập để tiếp tục'
    });
  }

  next();
};
