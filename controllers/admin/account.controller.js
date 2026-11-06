const AccountAdmin = require('../../models/accounts-admin.model');
const ForgotPassword = require('../../models/forgot-password.model');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateHelper = require('../../helpers/generate.helper');
const mailHelper = require('../../helpers/mail.helper');


module.exports.login = async (req, res) => {
  res.render('admin/pages/login', {
    pageTitle: 'Đăng nhập'
  });
}

module.exports.register = async (req, res) => {
  res.render('admin/pages/register', {
    pageTitle: 'Đăng ký'
  });
}

module.exports.loginPost = async (req, res) => {
  const { email, password, rememberPassword } = req.body;
  
  //Kiểm tra email có tồn tại trong hệ thống hay không
  const existAccount = await AccountAdmin.findOne({ 
    email: email 
  });

  if(!existAccount){
    res.json({
      code: "ERROR",
      message: "Email không tồn tại trong hệ thống"
    })
    return;
  }

  //Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, existAccount.password);
  if(!isPasswordValid){
    res.json({
      code: "ERROR",
      message: "Mật khẩu không đúng"
    })
    return;
  }

  //Kiểm tra tài khoản đã được kích hoạt hay chưa
  if(existAccount.status != "active"){
    res.json({
      code: "ERROR",
      message: "Tài khoản chưa được kích hoạt"
    })
    return;
  }

  //Tạo JWT
  const token = jwt.sign(
    { 
      id: existAccount.id,
      email: existAccount.email,
     }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: rememberPassword ? '30d' : '1d'
    }
  );

  res.cookie('token', token, {
    maxAge: rememberPassword ? (86400000 * 30) : 86400000, // 1 ngày
    httpOnly: true, // Không cho phép truy cập cookie từ phía client
    sameSite: "strict" // Chỉ gửi cookie trong cùng một trang web
  });

  res.json({
    code: "SUCCESS",
    message: "Đăng nhập tài khoản thành công"
  });
}

module.exports.registerPost = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existAccount = await AccountAdmin.findOne({ 
    email: email 
  });

  if(existAccount){
    res.json({
      code: "ERROR",
      message: "Email đã tồn tại trong hệ thống"
    })
    return;
  }

  // Mã hóa mật khẩu với thư viện bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // console.log("Chạy vào Controller");

  const newAccount = new AccountAdmin({
    fullName: fullName,
    email: email,
    password: hashedPassword,
    status: "initial"
  });
  await newAccount.save();

  res.json({
    code: "SUCCESS",
    message: 'Đăng ký thành công'
  });
}

module.exports.registerInitial = async (req, res) => {
  res.render("admin/pages/register-initial", {
    pageTitle: 'Tài khoản đã được khởi tạo'
  });
}

module.exports.forgotPassword = async (req, res) => {
  res.render('admin/pages/forgot-password', {
    pageTitle: 'Quên mật khẩu'
  });
}

module.exports.forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  //Kiểm tra email có tồn tại trong hệ thống hay không
  const existAccount = await AccountAdmin.findOne({ 
    email: email 
  });

  if(!existAccount){
    res.json({
      code: "ERROR",
      message: "Email không tồn tại trong hệ thống"
    })
    return;
  }
  
  //Kiểm tra xem email đã tồn tại trong bảng forgot-password chưa
  const existRecord = await ForgotPassword.findOne({
    email: email
  });
  if(existRecord){
    res.json({
      code: "ERROR",
      message: "Vui lòng gửi lại yêu cầu sau 5 phút"
    })
    return;
  }

  //Tạo mã OTP
  const otpCode = generateHelper.generateRandomNumber(6);
  console.log(otpCode);

  // Lưu vào Database email và mã OTP, sau 5 phút xóa bản ghi
  const record = new ForgotPassword({
    email: email,
    otp: otpCode,
    expireAt: new Date(Date.now() + 5*60*1000) // 5 phút
  });
  await record.save();


  // Gửi email tự động cho người dùng
  const subject = "Mã OTP lấy lại mật khẩu";
  const content = `Mã OTP của bạn là: <b>${otpCode}</b>. Mã có hiệu lực trong 5 phút, vui lòng không chia sẻ mã này cho bất kỳ ai.`;

  mailHelper.sendMail(email, subject, content);
  // jxnr hsqe mjly htkg

  res.json({
    code: "SUCCESS",
    message: "Đã gửi mã OTP về email của bạn"
  })
}

module.exports.otpPassword = async (req, res) => {
  res.render('admin/pages/otp-password', {
    pageTitle: 'Nhập mã OTP'
  });
}

module.exports.otpPasswordPost = async (req, res) => {
  const { email, otp } = req.body;

  const existRecord = await ForgotPassword.findOne({
    email: email,
    otp: otp
  });

  if(!existRecord){
    res.json({
      code: "ERROR",
      message: "Mã OTP không đúng"
    })
    return;
  }

  const account = await AccountAdmin.findOne({
    email: email
  });

  //Tạo JWT
  const token = jwt.sign(
    { 
      id: account.id,
      email: account.email,
     }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: '1d'
    }
  );

  res.cookie('token', token, {
    maxAge: 86400000, // 1 ngày
    httpOnly: true, // Không cho phép truy cập cookie từ phía client
    sameSite: "strict" // Chỉ gửi cookie trong cùng một trang web
  });

  res.json({
    code: "SUCCESS",
    message: "Xác thực mã OTP thành công"
  })
}

module.exports.resetPassword = async (req, res) => {
  res.render('admin/pages/reset-password', {
    pageTitle: 'Đổi mật khẩu'
  });
}

module.exports.resetPasswordPost = async (req, res) => {
  const { password } = req.body;

  // Mã hóa mật khẩu với thư viện bcrypt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt); 

  await AccountAdmin.updateOne(
    { _id: req.account.id },
    { password: hashedPassword } 
  );

  res.json({
    code: "SUCCESS",
    message: "Đổi mật khẩu thành công"
  })
}

module.exports.logoutPost = async (req, res) => {
  res.clearCookie('token');
  res.json({
    code: "SUCCESS",
    message: "Đăng xuất thành công"
  })
}