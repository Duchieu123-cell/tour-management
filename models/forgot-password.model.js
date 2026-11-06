const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: String,
    otp: String,
    expireAt: {
      type: Date,
      expires: 300
    }
})

const ForgotPassword = mongoose.model('ForgotPassword', schema, "forgot-password");

module.exports = ForgotPassword;