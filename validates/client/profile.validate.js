const Joi = require('joi');

const respondWithError = (res, error) => {
  return res.status(400).json({
    code: 'ERROR',
    message: error.details[0].message
  });
};

module.exports.updateProfile = (req, res, next) => {
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
    phone: Joi.string()
      .trim()
      .allow('')
      .pattern(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/)
      .messages({
        'string.pattern.base': 'Số điện thoại không đúng định dạng (VD: 0912345678)'
      }),
    avatar: Joi.string().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return respondWithError(res, error);
  }

  next();
};
