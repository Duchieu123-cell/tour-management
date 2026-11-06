const Joi = require('joi');

module.exports.aiSearchPost = (req, res, next) => {
  const schema = Joi.object({
    request: Joi.string()
      .trim()
      .min(3)
      .max(500)
      .required()
      .messages({
        'string.empty': 'Vui lòng nhập nhu cầu tìm tour',
        'string.min': 'Vui lòng mô tả nhu cầu cụ thể hơn',
        'string.max': 'Yêu cầu tìm kiếm không được vượt quá 500 ký tự'
      })
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      code: 'ERROR',
      message: error.details[0].message
    });
  }

  req.body.request = value.request;
  next();
};
