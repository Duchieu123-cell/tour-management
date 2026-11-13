const Joi = require('joi');

module.exports.registerPost = (req, res, next) => {

  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(3)
      .max(50)
      .messages({
        'string.empty': `Vui lòng nhập họ tên`,
        'string.min': `Họ tên ít nhất 3 ký tự`,
        'string.max': `Họ tên nhiều nhất 50 ký tự`
      }),

    email: Joi.string()
      .required()
      .email()
      .messages({
        'string.empty': `Vui lòng nhập email`,
        'string.email': `Email không đúng định dạng`
      }),

    password: Joi.string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error("password.uppercase");
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error("password.lowercase");
        }
        if (!/\d/.test(value)) {
          return helpers.error("password.number");
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error("password.special");
        }
        return value;
      })
      .messages({
        'string.empty': `Vui lòng nhập mật khẩu`,
        'string.min': `Mật khẩu ít nhất 8 ký tự`,
        'password.uppercase': `Mật khẩu bao gồm ít nhất 1 chữ cái in hoa`,
        'password.lowercase': `Mật khẩu bao gồm ít nhất 1 chữ cái in thường`,
        'password.number': `Mật khẩu bao gồm ít nhất 1 số`,
        'password.special': `Mật khẩu bao gồm ít nhất 1 ký tự đặc biệt`
      }),
  });

  const { error } = schema.validate(req.body);

  if(error){
    const errorMessage = error.details[0].message;

    res.json({
      code: "ERROR",
      message: errorMessage
    })
    return;
  }

  next();
}

module.exports.loginPost = (req, res, next) => {

  const schema = Joi.object({
    email: Joi.string()
      .trim()
      .required()
      .custom((value, helpers) => {
        if (value === 'admin') {
          return value;
        }
        const { error: emailErr } = Joi.string().email().validate(value);
        if (emailErr) {
          return helpers.error('string.email');
        }
        return value;
      })
      .messages({
        'string.empty': `Vui lòng nhập email`,
        'string.email': `Email không đúng định dạng`
      }),

    password: Joi.string()
      .required()
      .messages({
        'string.empty': `Vui lòng nhập mật khẩu`
      }),
    
    rememberPassword: Joi.boolean()
  });

  const { error } = schema.validate(req.body);

  if(error){
    const errorMessage = error.details[0].message;

    res.json({
      code: "ERROR",
      message: errorMessage
    })
    return;
  }

  next();
}