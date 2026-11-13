const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../../models/customer.model');
const CustomerPasswordReset = require('../../models/customer-password-reset.model');
const mailHelper = require('../../helpers/mail.helper');

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
    registered: req.query.registered === '1',
    passwordReset: req.query.passwordReset === '1'
  });
};

module.exports.loginPost = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const customer = await Customer.findOne({
    email,
    deleted: { $ne: true }
  });

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

module.exports.forgotPassword = (req, res) => {
  if (res.locals.customer) {
    return res.redirect('/');
  }

  res.render('client/pages/account-forgot-password', {
    pageTitle: 'Quên mật khẩu'
  });
};

module.exports.forgotPasswordPost = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const configuredOrigin = process.env.DOMAIN_WEBSITE?.trim();
  if (!configuredOrigin || !process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS?.trim()) {
    return res.status(503).json({
      code: 'ERROR',
      message: 'Chức năng đặt lại mật khẩu chưa được cấu hình trên máy chủ.'
    });
  }

  let resetOrigin;
  try {
    resetOrigin = new URL(configuredOrigin);
    if (!['http:', 'https:'].includes(resetOrigin.protocol)) {
      throw new Error('Unsupported reset URL protocol');
    }
  } catch (error) {
    return res.status(503).json({
      code: 'ERROR',
      message: 'Chức năng đặt lại mật khẩu chưa được cấu hình trên máy chủ.'
    });
  }

  const genericResponse = {
    code: 'SUCCESS',
    message: 'Nếu email này có tài khoản, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.'
  };

  const customer = await Customer.findOne({
    email,
    status: 'active',
    deleted: { $ne: true }
  }).select('_id email').lean();

  if (!customer) {
    return res.json(genericResponse);
  }

  const existingRequest = await CustomerPasswordReset.findOne({
    email,
    expiresAt: { $gt: new Date() }
  }).lean();
  if (existingRequest) {
    return res.json(genericResponse);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await CustomerPasswordReset.findOneAndUpdate(
    { email },
    { tokenHash, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const resetUrl = new URL('/account/reset-password', resetOrigin);
  resetUrl.searchParams.set('email', email);
  resetUrl.searchParams.set('token', token);

  try {
    await mailHelper.sendMailAsync(
      email,
      'Đặt lại mật khẩu tài khoản',
      `<p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu. Liên kết có hiệu lực trong 15 phút và chỉ dùng được một lần.</p><p><a href="${resetUrl.toString()}">Đặt lại mật khẩu</a></p><p>Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p>`
    );
  } catch (error) {
    await CustomerPasswordReset.deleteOne({ email, tokenHash });
    console.error('Customer password reset email failed:', error.message);
    return res.status(503).json({
      code: 'ERROR',
      message: 'Không gửi được email lúc này. Vui lòng kiểm tra cấu hình email của máy chủ rồi thử lại.'
    });
  }

  return res.json(genericResponse);
};

module.exports.resetPassword = (req, res) => {
  if (res.locals.customer) {
    return res.redirect('/');
  }

  res.render('client/pages/account-reset-password', {
    pageTitle: 'Đặt lại mật khẩu',
    email: typeof req.query.email === 'string' ? req.query.email : '',
    token: typeof req.query.token === 'string' ? req.query.token : ''
  });
};

module.exports.resetPasswordPost = async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const resetRequest = await CustomerPasswordReset.findOneAndDelete({
    email: req.body.email,
    tokenHash,
    expiresAt: { $gt: new Date() }
  });

  if (!resetRequest) {
    return res.status(400).json({
      code: 'ERROR',
      message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'
    });
  }

  const customer = await Customer.findOneAndUpdate({
    email: req.body.email,
    status: 'active',
    deleted: { $ne: true }
  }, {
    password: await bcrypt.hash(req.body.password, 10)
  });

  if (!customer) {
    return res.status(400).json({
      code: 'ERROR',
      message: 'Không thể đặt lại mật khẩu cho tài khoản này.'
    });
  }

  await CustomerPasswordReset.deleteMany({ email: req.body.email });

  return res.json({
    code: 'SUCCESS',
    message: 'Đặt lại mật khẩu thành công.'
  });
};
