const Joi = require('joi');

const respondWithError = (res, error) => {
  res.status(400).json({
    code: 'ERROR',
    message: error.details[0].message
  });
};

module.exports.registerPost = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập họ tên',
        'string.min': 'Họ tên ít nhất 3 ký tự',
        'string.max': 'Họ tên nhiều nhất 50 ký tự'
      }),
    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập email',
        'string.email': 'Email không đúng định dạng'
      }),
    password: Joi.string()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error('password.uppercase');
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }
        if (!/\d/.test(value)) {
          return helpers.error('password.number');
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error('password.special');
        }
        return value;
      })
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu',
        'string.min': 'Mật khẩu ít nhất 8 ký tự',
        'password.uppercase': 'Mật khẩu cần có ít nhất 1 chữ cái in hoa',
        'password.lowercase': 'Mật khẩu cần có ít nhất 1 chữ cái in thường',
        'password.number': 'Mật khẩu cần có ít nhất 1 chữ số',
        'password.special': 'Mật khẩu cần có ít nhất 1 ký tự đặc biệt'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }

  next();
};

module.exports.loginPost = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập email',
        'string.email': 'Email không đúng định dạng'
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu'
      }),
    rememberPassword: Joi.boolean()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }

  next();
};
