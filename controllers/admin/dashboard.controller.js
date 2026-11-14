const moment = require('moment');
const mongoose = require('mongoose');

const Order = require('../../models/order.model');
const Customer = require('../../models/customer.model');
const Tour = require('../../models/tour.model');

const RECENT_ORDER_LIMIT = 6;
const UPCOMING_TOUR_LIMIT = 5;
const LOW_SEAT_THRESHOLD = 5;

const ORDER_STATUS = {
  initial: { name: 'Khởi tạo', tone: 'warning', icon: 'fa-clock' },
  done: { name: 'Hoàn thành', tone: 'good', icon: 'fa-circle-check' },
  cancel: { name: 'Đã hủy', tone: 'critical', icon: 'fa-circle-xmark' }
};

const PAYMENT_STATUS = {
  paid: { name: 'Đã thanh toán', tone: 'good', icon: 'fa-circle-check' },
  unpaid: { name: 'Chưa thanh toán', tone: 'neutral', icon: 'fa-hourglass-half' }
};

const isActiveOrder = (order) => order.status !== 'cancel';

const sumTotal = (orders) => orders.reduce((total, order) => total + (order.total || 0), 0);

// Phần trăm thay đổi; không có kỳ trước thì không so sánh được
const getChangePercent = (current, previous) => {
  if (!previous) {
    return null;
  }
  return Math.round(((current - previous) / previous) * 100);
};

// Doanh thu cộng dồn theo ngày; sau lastDay để null để đường dừng tại đó
const getCumulativeRevenue = (orders, totalDays, lastDay) => {
  const dailyRevenue = Array(totalDays).fill(0);
  orders.forEach((order) => {
    dailyRevenue[moment(order.createdAt).date() - 1] += order.total || 0;
  });

  let runningTotal = 0;
  return dailyRevenue.map((revenue, index) => {
    if (index >= lastDay) {
      return null;
    }
    runningTotal += revenue;
    return runningTotal;
  });
};

const getSelectedMonth = (value, now) => {
  const month = typeof value === 'string' ? moment(value, 'YYYY-MM', true) : moment.invalid();
  const isUsable = month.isValid() && !month.isAfter(now, 'month');
  return (isUsable ? month : now).clone().startOf('month');
};

const getRecentOrders = async (orders) => {
  const recentOrders = orders.slice(0, RECENT_ORDER_LIMIT);
  const tourIds = [...new Set(recentOrders.flatMap((order) => order.items.map((item) => item.tourId)))]
    .filter(mongoose.isValidObjectId);

  const tours = await Tour.find({ _id: { $in: tourIds } }).select('name').lean();
  const tourNameById = new Map(tours.map((tour) => [String(tour._id), tour.name]));

  return recentOrders.map((order) => {
    const firstItem = order.items[0];
    return {
      id: order._id,
      code: order.code,
      fullName: order.fullName,
      phoneNumber: order.phoneNumber,
      total: order.total || 0,
      tourName: (firstItem && tourNameById.get(String(firstItem.tourId))) || 'Tour không còn tồn tại',
      otherTourCount: Math.max(order.items.length - 1, 0),
      status: ORDER_STATUS[order.status] || { name: order.status, tone: 'neutral', icon: 'fa-circle' },
      paymentStatus: PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.unpaid,
      createdAtFormat: moment(order.createdAt).format('HH:mm DD/MM/YYYY')
    };
  });
};

const getUpcomingTours = async (now) => {
  const tours = await Tour.find({
    deleted: false,
    status: 'active',
    departureDate: { $gte: now.clone().startOf('day').toDate() }
  })
    .sort({ departureDate: 'asc' })
    .limit(UPCOMING_TOUR_LIMIT)
    .select('name departureDate stockAdult stockChildren stockBaby')
    .lean();

  return tours.map((tour) => {
    const seats = (tour.stockAdult || 0) + (tour.stockChildren || 0) + (tour.stockBaby || 0);
    return {
      id: tour._id,
      name: tour.name,
      seats,
      isLowSeat: seats <= LOW_SEAT_THRESHOLD,
      departureDateFormat: moment(tour.departureDate).format('DD/MM/YYYY'),
      daysLeft: moment(tour.departureDate).startOf('day').diff(now.clone().startOf('day'), 'days')
    };
  });
};

module.exports.dashboard = async (req, res) => {
  const now = moment();
  const monthStart = getSelectedMonth(req.query.month, now);
  const monthEnd = monthStart.clone().add(1, 'month');
  const previousStart = monthStart.clone().subtract(1, 'month');
  const isCurrentMonth = monthStart.isSame(now, 'month');

  // Tháng đang chạy so với cùng kỳ tháng trước, không so với cả tháng
  const previousCutoff = isCurrentMonth
    ? previousStart.clone().date(Math.min(now.date(), previousStart.daysInMonth())).endOf('day')
    : monthStart;

  const [orders, customerTotal, customerCurrent, customerPrevious, recentTourList] = await Promise.all([
    Order.find({
      deleted: false,
      createdAt: { $gte: previousStart.toDate(), $lt: monthEnd.toDate() }
    }).sort({ createdAt: 'desc' }).lean(),
    Customer.countDocuments({ deleted: { $ne: true } }),
    Customer.countDocuments({
      deleted: { $ne: true },
      createdAt: { $gte: monthStart.toDate(), $lt: monthEnd.toDate() }
    }),
    Customer.countDocuments({
      deleted: { $ne: true },
      createdAt: { $gte: previousStart.toDate(), $lt: previousCutoff.toDate() }
    }),
    getUpcomingTours(now)
  ]);

  const monthOrders = orders.filter((order) => order.createdAt >= monthStart.toDate());
  const previousOrders = orders.filter((order) => order.createdAt < monthStart.toDate());
  const activeOrders = monthOrders.filter(isActiveOrder);
  const activePreviousOrders = previousOrders.filter(isActiveOrder);
  const comparableOrders = activePreviousOrders.filter((order) => order.createdAt < previousCutoff.toDate());
  const unpaidOrders = activeOrders.filter((order) => order.paymentStatus !== 'paid');

  const revenue = sumTotal(activeOrders);

  const totalDays = Math.max(monthStart.daysInMonth(), previousStart.daysInMonth());
  const currentSeries = getCumulativeRevenue(
    activeOrders,
    totalDays,
    isCurrentMonth ? now.date() : monthStart.daysInMonth()
  );
  const previousSeries = getCumulativeRevenue(activePreviousOrders, totalDays, previousStart.daysInMonth());

  res.render('admin/pages/dashboard', {
    pageTitle: 'Tổng quan',
    selectedMonth: monthStart.format('YYYY-MM'),
    maxMonth: now.format('YYYY-MM'),
    monthLabel: monthStart.format('MM/YYYY'),
    previousMonthLabel: previousStart.format('MM/YYYY'),
    isCurrentMonth,
    comparisonDay: now.date(),
    stats: {
      revenue,
      revenueChange: getChangePercent(revenue, sumTotal(comparableOrders)),
      orderCount: activeOrders.length,
      orderChange: getChangePercent(activeOrders.length, comparableOrders.length),
      cancelledCount: monthOrders.length - activeOrders.length,
      unpaidTotal: sumTotal(unpaidOrders),
      unpaidCount: unpaidOrders.length,
      customerCurrent,
      customerChange: getChangePercent(customerCurrent, customerPrevious),
      customerTotal
    },
    chart: {
      labels: Array.from({ length: totalDays }, (_, index) => index + 1),
      current: currentSeries,
      previous: previousSeries,
      currentLabel: `Tháng ${monthStart.format('MM/YYYY')}`,
      previousLabel: `Tháng ${previousStart.format('MM/YYYY')}`
    },
    recentOrders: await getRecentOrders(monthOrders),
    upcomingTours: recentTourList
  });
};
