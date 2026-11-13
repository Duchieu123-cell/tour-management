const Joi = require('joi');

const respondWithError = (res, error) => {
  return res.json({
    code: 'ERROR',
    message: error.details[0].message
  });
};

module.exports.createPost = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập họ tên',
        'string.min': 'Họ tên ít nhất 3 ký tự',
        'string.max': 'Họ tên nhiều nhất 50 ký tự',
        'any.required': 'Vui lòng nhập họ tên'
      }),
    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập email',
        'string.email': 'Email không đúng định dạng',
        'any.required': 'Vui lòng nhập email'
      }),
    password: Joi.string()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) return helpers.error('password.uppercase');
        if (!/[a-z]/.test(value)) return helpers.error('password.lowercase');
        if (!/\d/.test(value)) return helpers.error('password.number');
        if (!/[@$!%*?&]/.test(value)) return helpers.error('password.special');
        return value;
      })
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập mật khẩu',
        'string.min': 'Mật khẩu ít nhất 8 ký tự',
        'password.uppercase': 'Mật khẩu cần ít nhất 1 chữ hoa',
        'password.lowercase': 'Mật khẩu cần ít nhất 1 chữ thường',
        'password.number': 'Mật khẩu cần ít nhất 1 chữ số',
        'password.special': 'Mật khẩu cần ít nhất 1 ký tự đặc biệt (@$!%*?&)',
        'any.required': 'Vui lòng nhập mật khẩu'
      }),
    phone: Joi.string()
      .trim()
      .allow('')
      .pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)
      .messages({
        'string.pattern.base': 'Số điện thoại không đúng định dạng (VD: 0912345678)'
      }),
    gender: Joi.string().valid('male', 'female', 'other', '').allow(''),
    dob: Joi.date().iso().max('now').allow('', null).messages({
      'date.max': 'Ngày sinh không được ở tương lai'
    }),
    address: Joi.string().trim().max(255).allow(''),
    status: Joi.string().valid('active', 'inactive').default('active')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }
  next();
};

module.exports.editPatch = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .messages({
        'string.empty': 'Vui lòng nhập họ tên',
        'string.min': 'Họ tên ít nhất 3 ký tự',
        'string.max': 'Họ tên nhiều nhất 50 ký tự'
      }),
    email: Joi.string()
      .trim()
      .email()
      .messages({
        'string.empty': 'Vui lòng nhập email',
        'string.email': 'Email không đúng định dạng'
      }),
    password: Joi.string()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) return helpers.error('password.uppercase');
        if (!/[a-z]/.test(value)) return helpers.error('password.lowercase');
        if (!/\d/.test(value)) return helpers.error('password.number');
        if (!/[@$!%*?&]/.test(value)) return helpers.error('password.special');
        return value;
      })
      .allow('')
      .messages({
        'string.min': 'Mật khẩu ít nhất 8 ký tự',
        'password.uppercase': 'Mật khẩu cần ít nhất 1 chữ hoa',
        'password.lowercase': 'Mật khẩu cần ít nhất 1 chữ thường',
        'password.number': 'Mật khẩu cần ít nhất 1 chữ số',
        'password.special': 'Mật khẩu cần ít nhất 1 ký tự đặc biệt (@$!%*?&)'
      }),
    phone: Joi.string()
      .trim()
      .allow('')
      .pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)
      .messages({
        'string.pattern.base': 'Số điện thoại không đúng định dạng (VD: 0912345678)'
      }),
    gender: Joi.string().valid('male', 'female', 'other', '').allow(''),
    dob: Joi.date().iso().max('now').allow('', null),
    address: Joi.string().trim().max(255).allow(''),
    status: Joi.string().valid('active', 'inactive')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }
  next();
};
