const jwt = require('jsonwebtoken');
const Customer = require('../../models/customer.model');

module.exports.optionalCustomer = async (req, res, next) => {
  res.locals.customer = null;

  const token = req.cookies.customerToken;
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
    status: 'active'
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
    return res.redirect('/account/login');
  }

  next();
};
