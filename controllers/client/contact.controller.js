const Contact = require('../../models/contact.model');

module.exports.createPost = async (req, res) => {
  const { email } = req.body;

  const existingContact = await Contact.findOne({
    email: email, 
    deleted: false 
  });

  if(existingContact){
    return res.json({ 
      code: "ERROR",
      message: "Email đã tồn tại trong hệ thống."
    });
  }

  const newRecord = new Contact({
    email: email,
  });
  await newRecord.save();

  req.flash('success', 'Cảm ơn bạn đã đăng ký');

  res.json({ 
    code: "SUCCESS",
  });
}