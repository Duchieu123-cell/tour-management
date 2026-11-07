const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../../models/customer.model');

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict'
};

module.exports.login = (req, res) => {
  if (res.locals.customer) {
    return res.redirect('/');
  }

  res.render('client/pages/account-login', {
    pageTitle: 'Đăng nhập',
    registered: req.query.registered === '1'
  });
};

module.exports.loginPost = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const customer = await Customer.findOne({ email });

  if (!customer) {
    return res.status(401).json({
      code: 'ERROR',
      message: 'Email hoặc mật khẩu không đúng'
    });
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, customer.password);
  if (!isPasswordValid || customer.status !== 'active') {
    return res.status(401).json({
      code: 'ERROR',
      message: 'Email hoặc mật khẩu không đúng'
    });
  }

  const rememberPassword = req.body.rememberPassword === true;
  const token = jwt.sign(
    {
      id: customer.id,
      email: customer.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberPassword ? '30d' : '1d'
    }
  );

  res.cookie('customerToken', token, {
    ...cookieOptions,
    maxAge: rememberPassword ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  });

  res.json({
    code: 'SUCCESS',
    message: 'Đăng nhập thành công'
  });
};

module.exports.register = (req, res) => {
  if (res.locals.customer) {
    return res.redirect('/');
  }

  res.render('client/pages/account-register', {
    pageTitle: 'Đăng ký'
  });
};

module.exports.registerPost = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const existingCustomer = await Customer.findOne({ email });

  if (existingCustomer) {
    return res.status(409).json({
      code: 'ERROR',
      message: 'Email đã được sử dụng'
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const customer = new Customer({
      fullName: req.body.fullName.trim(),
      email,
      password: hashedPassword,
      status: 'active'
    });
    await customer.save();
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        code: 'ERROR',
        message: 'Email đã được sử dụng'
      });
    }
    throw error;
  }

  res.json({
    code: 'SUCCESS',
    message: 'Đăng ký thành công'
  });
};

module.exports.profile = (req, res) => {
  res.render('client/pages/account-profile', {
    pageTitle: 'Hồ sơ cá nhân'
  });
};

module.exports.logoutPost = (req, res) => {
  res.clearCookie('customerToken', cookieOptions);
  res.redirect('/account/login');
};

module.exports.changePassword = async (req, res) => {
  const customer = await Customer.findById(res.locals.customer._id);

  if (!customer) {
    return res.status(404).json({
      code: 'ERROR',
      message: 'Không tìm thấy tài khoản'
    });
  }

  const isCurrentPasswordValid = await bcrypt.compare(req.body.currentPassword, customer.password);
  if (!isCurrentPasswordValid) {
    return res.status(401).json({
      code: 'ERROR',
      message: 'Mật khẩu hiện tại không đúng'
    });
  }

  if (req.body.currentPassword === req.body.newPassword) {
    return res.status(400).json({
      code: 'ERROR',
      message: 'Mật khẩu mới phải khác mật khẩu hiện tại'
    });
  }

  customer.password = await bcrypt.hash(req.body.newPassword, 10);
  await customer.save();

  res.json({
    code: 'SUCCESS',
    message: 'Đổi mật khẩu thành công'
  });
};
