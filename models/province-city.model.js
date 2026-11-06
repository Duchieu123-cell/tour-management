const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: String,
});

const ProvinceCity = mongoose.model('ProvinceCity', schema, '34-provinces-cities');

module.exports = ProvinceCity;