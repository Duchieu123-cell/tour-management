const jwt = require('jsonwebtoken');
const Customer = require('../../models/customer.model');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict'
};

module.exports.optionalCustomer = async (req, res, next) => {
  res.locals.customer = null;
  req.customer = null;

  const authorization = req.headers.authorization;
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;
  const token = req.cookies?.customerToken || bearerToken;

  if (!token) {
    return next();
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.clearCookie('customerToken', cookieOptions);
    return next();
  }

  const customer = await Customer.findOne({
    _id: decoded.id,
    email: decoded.email,
    status: 'active',
    deleted: { $ne: true }
  }).select('_id fullName email phone avatar dob gender address');

  if (!customer) {
    res.clearCookie('customerToken', cookieOptions);
    return next();
  }

  res.locals.customer = customer;
  req.customer = customer;
  return next();
};

module.exports.requireCustomer = (req, res, next) => {
  if (!res.locals.customer) {
    const acceptsJson = req.headers.accept?.includes('application/json');
    if (req.xhr || acceptsJson || req.method !== 'GET') {
      return res.status(401).json({
        code: 'ERROR',
        message: 'Vui lòng đăng nhập để thực hiện thao tác này'
      });
    }

    return res.redirect('/account/login');
  }

  return next();
};