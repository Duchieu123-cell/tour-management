const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model(
  'CustomerPasswordReset',
  schema,
  'customer-password-resets'
);
