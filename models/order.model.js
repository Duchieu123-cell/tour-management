const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema({
  code: String,
  customerId: String,
  fullName: String,
  phoneNumber: String,
  note: String,
  items: Array,
  subTotal: Number,
  total: Number,
  paymentMethod: String,
  paymentStatus: String,
  status: String,
  upadateBy: String,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedBy: String,
  deletedAt: Date,
}, {
  timestamps: true // Tự động sinh ra createdAt, updatedAt
})

const Order = mongoose.model('Order', schema, "orders");

module.exports = Order;