const Joi = require('joi');

module.exports.createPost = (req, res, next) => {
  console.log(req.body);
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .messages({
        "string.empty": `Vui lòng nhập tên nhóm quyền`
      }),
    description: Joi.string().allow(''),
    permissions: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .messages({
        "array.min": `Vui lòng chọn ít nhất 1 quyền`
      }),
  });

  const { error } = schema.validate(req.body);

  if(error){
    const errorMessage = error.details[0].message;

    res.json({
      code: "ERROR",
      message: errorMessage
    });
    return;
  }

  next();
}