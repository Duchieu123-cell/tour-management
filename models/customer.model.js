const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'active'
  },
  dob: {
    type: Date
  },
  phone: {
    type: String
  },
  gender: {
    type: String
  },
  address: {
    type: String
  },
}, {
  timestamps: true
});

const Customer = mongoose.model('Customer', schema, 'customers');

module.exports = Customer;
