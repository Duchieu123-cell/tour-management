const Order = require('../../models/order.model');
const AccountAdmin = require('../../models/accounts-admin.model');


module.exports.dashboard = async (req, res) => {
  // Thông số tổng quan
  const overview = {
    totalAdmin: 0,
    totalUser: 0,
    totalOrder: 0,
    totalRevenue: 0
  }

  overview.totalAdmin = await AccountAdmin.countDocuments({
    deleted: false 
  });

  const orderList = await Order.find({
    deleted: false
  });

  overview.totalOrder = orderList.length;
  overview.totalRevenue = orderList.reduce((total, order) => {
    return total + order.total;
  }, 0);
  // Hết thông số tổng quan
  
  res.render('admin/pages/dashboard', {
    pageTitle: 'Tổng quan',
    overview: overview
  });
}

module.exports.revenueChartPost = async (req, res) => {
  const { currentMonth, currentYear, lastMonth, lastYear, days } = req.body;

  // Truy vấn tất cả đơn hàng trong tháng hiện tại
  const ordersCurrentMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(currentYear, currentMonth - 1, 1),
      $lt: new Date(currentYear, currentMonth, 1)
    }
  });

  // Truy vấn tất cả đơn hàng trong tháng trước đó
  const ordersLastMonth = await Order.find({
    deleted: false,
    createdAt: {
      $gte: new Date(lastYear, lastMonth - 1, 1),
      $lt: new Date(lastYear, lastMonth, 1)
    }
  });

  const revenueCurrentMonth = Array(days.length).fill(0);
  const revenueLastMonth = Array(days.length).fill(0);

  // Tính doanh thu cho từng ngày trong tháng hiện tại
  ordersCurrentMonth.forEach(order => {
    const day = order.createdAt.getDate();
    revenueCurrentMonth[day - 1] += order.total;
  });

  // Tính doanh thu cho từng ngày trong tháng trước đó
  ordersLastMonth.forEach(order => {
    const day = order.createdAt.getDate();
    revenueLastMonth[day - 1] += order.total;
  });

  res.json({
    code: "SUCCESS",
    revenueCurrentMonth: revenueCurrentMonth,
    revenueLastMonth: revenueLastMonth
  });
}