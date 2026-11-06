const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const schema = new mongoose.Schema({
  name: String,
  slug: { 
    type: String, 
    slug: "name",
    unique: true 
  },
  parent: String,
  position: Number,
  avatar: String,
  status: String,
  description: String,
  createdBy: String,
  updatedBy: String,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedBy: String,
  deletedAt: Date,
}, {
  timestamps: true // Tự động sinh ra createdAt, updatedAt
})

const Category = mongoose.model('Category', schema, "categories");

module.exports = Category;