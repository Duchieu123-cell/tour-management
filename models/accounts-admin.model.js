const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullName: String,
  email: String,
  phoneNumber: String,
  role: String,
  positionCompany: String,
  password: String,
  status: String,
  avatar: String,
  createdBy: String,
  updatedBy: String,
  deleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: Date,
  deletedBy: String
})

const AccountAdmin = mongoose.model('AccountAdmin', schema, "accounts-admin");

module.exports = AccountAdmin;