const moment = require('moment');

const Tour = require('../../models/tour.model');
const City = require('../../models/province-city.model');

module.exports.cart = async (req, res) => {
  res.render('client/pages/cart', {
    pageTitle: 'Trang giỏ hàng'
  });
}

module.exports.detailPost = async (req, res) => {
  const cart = req.body;

  for(const item of cart) {
    const tourInfo = await Tour.findOne({
      _id: item.tourId,
      status: 'active',
      deleted: false 
    });

    if(tourInfo) {
      item.avatar = tourInfo.avatar;
      item.name = tourInfo.name;
      item.slug = tourInfo.slug;
      item.departureDateFormat = moment(tourInfo.departureDate).format('DD/MM/YYYY');
      
      const city = await City.findOne({
        _id: item.locationFrom
      });
      item.locationFromName = city.name;

      item.stockAdult = tourInfo.stockAdult;
      item.stockChildren = tourInfo.stockChildren;
      item.stockBaby = tourInfo.stockBaby;

      if(item.quantityAdult > item.stockAdult) {
        item.quantityAdult = item.stockAdult;
      }
      if(item.quantityChildren > item.stockChildren) {
        item.quantityChildren = item.stockChildren;
      }
      if(item.quantityBaby > item.stockBaby) {
        item.quantityBaby = item.stockBaby;
      }

      item.newPriceAdult = tourInfo.newPriceAdult;
      item.newPriceChildren = tourInfo.newPriceChildren;
      item.newPriceBaby = tourInfo.newPriceBaby;
    } else {
      const index = cart.findIndex(tour => tour.tourId == item.tourId);
      cart.splice(index, 1);
    }
  }

  res.json({
    code: "SUCCESS",
    message: "Lấy chi tiết giỏ hàng thành công",
    cart: cart
  });
}