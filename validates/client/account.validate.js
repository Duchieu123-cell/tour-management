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

module.exports.changePassword = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Vui lòng nhập mật khẩu hiện tại',
        'string.empty': 'Vui lòng nhập mật khẩu hiện tại'
      }),
    newPassword: Joi.string()
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
        'any.required': 'Vui lòng nhập mật khẩu mới',
        'string.empty': 'Vui lòng nhập mật khẩu mới',
        'string.min': 'Mật khẩu ít nhất 8 ký tự',
        'password.uppercase': 'Mật khẩu cần có ít nhất 1 chữ cái in hoa',
        'password.lowercase': 'Mật khẩu cần có ít nhất 1 chữ cái in thường',
        'password.number': 'Mật khẩu cần có ít nhất 1 chữ số',
        'password.special': 'Mật khẩu cần có ít nhất 1 ký tự đặc biệt'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.required': 'Vui lòng nhập lại mật khẩu mới',
        'any.only': 'Mật khẩu nhập lại không khớp',
        'string.empty': 'Vui lòng nhập lại mật khẩu mới'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }

  next();
};

module.exports.forgotPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required()
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }

  req.body.email = value.email.toLowerCase();
  next();
};

module.exports.resetPassword = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
    token: Joi.string().hex().length(64).required(),
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
        'string.min': 'Mật khẩu ít nhất 8 ký tự',
        'password.uppercase': 'Mật khẩu cần có ít nhất 1 chữ cái in hoa',
        'password.lowercase': 'Mật khẩu cần có ít nhất 1 chữ cái in thường',
        'password.number': 'Mật khẩu cần có ít nhất 1 chữ số',
        'password.special': 'Mật khẩu cần có ít nhất 1 ký tự đặc biệt (@$!%*?&)'
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Mật khẩu nhập lại không khớp'
    })
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }

  req.body.email = value.email.toLowerCase();
  next();
};
