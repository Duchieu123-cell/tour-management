const moment = require('moment');
const CryptoJS = require('crypto-js');
const axios = require('axios');
const mongoose = require('mongoose');

const generateHelper = require('../../helpers/generate.helper');
const sortHelper = require('../../helpers/sort.helper');
const Tour = require('../../models/tour.model');
const Order = require('../../models/order.model');
const City = require('../../models/province-city.model');
const { getTodayStart } = require('../../helpers/tour-date.helper');

const ORDER_STATUS_NAMES = {
  done: 'Đã đặt',
  cancel: 'Đã hủy'
};

// Đơn được xác nhận ngay khi đặt; đơn cũ còn "initial" cũng tính là đã đặt
const ORDER_STATUS_QUERIES = {
  done: { $in: ['initial', 'done'] },
  cancel: 'cancel'
};

const getCustomerOrderStatus = (status) => (status === 'initial' ? 'done' : status);

const PAYMENT_STATUS_NAMES = {
  unpaid: 'Chưa thanh toán',
  paid: 'Đã thanh toán'
};

const PAYMENT_METHOD_NAMES = {
  money: 'Thanh toán tiền mặt',
  momo: 'Ví MoMo',
  bank: 'Chuyển khoản ngân hàng',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay'
};

const formatPassengers = (item) => {
  return [
    [item.quantityAdult, 'người lớn'],
    [item.quantityChildren, 'trẻ em'],
    [item.quantityBaby, 'em bé']
  ]
    .filter(([quantity]) => quantity > 0)
    .map(([quantity, label]) => `${quantity} ${label}`)
    .join(', ');
};

module.exports.createPost = async (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ code: 'ERROR', message: 'Vui lòng chọn ít nhất một tour.' });
  }

  const reservations = [];
  const invalidQuantity = items.some((item) =>
    ['quantityAdult', 'quantityChildren', 'quantityBaby'].some((key) =>
      !Number.isSafeInteger(Number(item[key])) || Number(item[key]) < 0
    ) || (Number(item.quantityAdult) + Number(item.quantityChildren) + Number(item.quantityBaby) <= 0)
  );
  if (invalidQuantity) {
    return res.status(400).json({ code: 'ERROR', message: 'Số lượng hành khách không hợp lệ.' });
  }

  // Reserve each requested quantity atomically so concurrent bookings cannot oversell a tour.
  for (const item of items) {
    const quantities = {
      stockAdult: Number(item.quantityAdult),
      stockChildren: Number(item.quantityChildren),
      stockBaby: Number(item.quantityBaby)
    };
    const tour = await Tour.findOneAndUpdate({
      _id: item.tourId,
      status: 'active',
      deleted: false,
      departureDate: { $gte: getTodayStart() },
      stockAdult: { $gte: quantities.stockAdult },
      stockChildren: { $gte: quantities.stockChildren },
      stockBaby: { $gte: quantities.stockBaby }
    }, {
      $inc: {
        stockAdult: -quantities.stockAdult,
        stockChildren: -quantities.stockChildren,
        stockBaby: -quantities.stockBaby
      }
    }, { new: false });

    if (!tour) {
      for (const reservation of reservations) {
        await Tour.updateOne({ _id: reservation.tourId }, { $inc: reservation.quantities });
      }
      const currentTour = await Tour.findById(item.tourId).select('name departureDate stockAdult stockChildren stockBaby').lean();
      if (!currentTour) {
        return res.status(400).json({ code: 'ERROR', message: 'Một tour trong giỏ hàng không còn khả dụng.' });
      }
      if (!currentTour.departureDate || currentTour.departureDate < getTodayStart()) {
        return res.status(409).json({ code: 'ERROR', message: `Tour "${currentTour.name}" đã qua ngày khởi hành nên không thể đặt.` });
      }
      const labels = [
        ['quantityAdult', 'stockAdult', 'người lớn'],
        ['quantityChildren', 'stockChildren', 'trẻ em'],
        ['quantityBaby', 'stockBaby', 'em bé']
      ];
      const shortage = labels.find(([quantity, stock]) => Number(item[quantity]) > (currentTour[stock] || 0));
      const message = shortage
        ? `Tour "${currentTour.name}" chỉ còn ${currentTour[shortage[1]] || 0} ${shortage[2]}; vui lòng điều chỉnh số lượng.`
        : `Tour "${currentTour.name}" vừa hết chỗ hoặc không còn khả dụng. Vui lòng tải lại giỏ hàng.`;
      return res.status(409).json({ code: 'ERROR', message });
    }
    reservations.push({ tourId: item.tourId, quantities });

    item.newPriceAdult = tour.newPriceAdult;
    item.newPriceChildren = tour.newPriceChildren;
    item.newPriceBaby = tour.newPriceBaby;
    item.departureDate = tour.departureDate;
  }

  // Mã đơn hàng
  req.body.code = `OD${generateHelper.generateRandomNumber(10)}`;

  // Chủ đơn lấy từ phiên đăng nhập, không nhận từ body
  req.body.customerId = res.locals.customer.id || String(res.locals.customer._id);

  // Thanh toán
  // Tạm tính
  req.body.subTotal = req.body.items.reduce((total, item) => {
    return total + 
      (item.newPriceAdult * item.quantityAdult) + 
      (item.newPriceChildren * item.quantityChildren) + 
      (item.newPriceBaby * item.quantityBaby);
  }, 0);
  // Tổng tiền
  req.body.total = req.body.subTotal;
  // Discount
  // Trạng thái thanh toán
  req.body.paymentStatus = 'unpaid'; // paid, unpaid

  // Trạng thái đơn hàng
  req.body.status = 'done'; // initial, done, cancel

  const newRecord = new Order(req.body);
  await newRecord.save();

  res.json({
    code: "SUCCESS",
    message: "Tạo đơn hàng thành công",
    orderCode: req.body.code
  });
}

module.exports.myOrders = async (req, res) => {
  const status = Object.keys(ORDER_STATUS_QUERIES).includes(req.query.status) ? req.query.status : '';
  const customerId = res.locals.customer?.id || (res.locals.customer?._id ? String(res.locals.customer._id) : '');

  if (!customerId) {
    return res.redirect('/account/login');
  }

  const find = {
    customerId,
    deleted: false
  };
  if (status) {
    find.status = ORDER_STATUS_QUERIES[status];
  }

  const orders = await Order.find(find).sort({ createdAt: 'desc' }).lean();
  const items = orders.flatMap((order) => order.items);

  const tourIds = [...new Set(items.map((item) => item.tourId))].filter(mongoose.isValidObjectId);
  const cityIds = [...new Set(items.map((item) => item.locationFrom))].filter(mongoose.isValidObjectId);

  const [tours, cities] = await Promise.all([
    Tour.find({ _id: { $in: tourIds } }).select('name slug avatar').lean(),
    City.find({ _id: { $in: cityIds } }).select('name').lean()
  ]);

  const tourById = new Map(tours.map((tour) => [String(tour._id), tour]));
  const cityById = new Map(cities.map((city) => [String(city._id), city]));

  const orderList = orders.map((order) => ({
    ...order,
    status: getCustomerOrderStatus(order.status),
    statusName: ORDER_STATUS_NAMES[getCustomerOrderStatus(order.status)] || order.status,
    paymentStatusName: PAYMENT_STATUS_NAMES[order.paymentStatus] || order.paymentStatus,
    paymentMethodName: PAYMENT_METHOD_NAMES[order.paymentMethod] || order.paymentMethod,
    createdAtFormat: moment(order.createdAt).format('HH:mm - DD/MM/YYYY'),
    detailUrl: `/order/success?code=${encodeURIComponent(order.code)}&phoneNumber=${encodeURIComponent(order.phoneNumber)}`,
    items: order.items.map((item) => {
      const tour = tourById.get(String(item.tourId));
      return {
        ...item,
        name: tour ? tour.name : 'Tour không còn tồn tại',
        slug: tour && tour.slug,
        avatar: tour && tour.avatar,
        departureDateFormat: item.departureDate ? moment(item.departureDate).format('DD/MM/YYYY') : '',
        locationFromName: cityById.get(String(item.locationFrom))?.name,
        passengers: formatPassengers(item)
      };
    })
  }));

  res.render('client/pages/account-orders', {
    pageTitle: 'Đơn đặt tour của tôi',
    orders: orderList,
    status,
    statusFilters: [
      { value: '', label: 'Tất cả' },
      ...Object.keys(ORDER_STATUS_QUERIES).map((value) => ({ value, label: ORDER_STATUS_NAMES[value] }))
    ]
  });
};

module.exports.cancelMyOrder = async (req, res) => {
  const customerId = res.locals.customer?.id || (res.locals.customer?._id ? String(res.locals.customer._id) : '');
  if (!customerId) {
    return res.status(401).json({
      code: 'ERROR',
      message: 'Vui lòng đăng nhập để tiếp tục'
    });
  }

  // Lọc theo chủ đơn và trạng thái trong cùng một lệnh để không hoàn chỗ hai lần
  const order = await Order.findOneAndUpdate({
    code: req.params.code,
    customerId,
    deleted: false,
    status: ORDER_STATUS_QUERIES.done
  }, {
    status: 'cancel'
  });

  if (!order) {
    return res.status(400).json({
      code: 'ERROR',
      message: 'Không thể hủy đơn này'
    });
  }

  // Hoàn lại số chỗ đã trừ khi đặt
  for (const item of order.items) {
    await Tour.updateOne({
      _id: item.tourId
    }, {
      $inc: {
        stockAdult: item.quantityAdult,
        stockChildren: item.quantityChildren,
        stockBaby: item.quantityBaby
      }
    });
  }

  req.flash('success', `Đã hủy đơn ${order.code}`);

  res.json({
    code: 'SUCCESS',
    message: 'Hủy đơn thành công'
  });
};

module.exports.success = async (req, res) => {
  const { code, phoneNumber } = req.query;

  const orderDetail = await Order.findOne({
    code: code,
    phoneNumber: phoneNumber
  });

  if(orderDetail){
    switch(orderDetail.paymentMethod){
      case 'money':
        orderDetail.paymentMethodName = "Thanh toán tiền mặt";
        break;
      case 'momo':
        orderDetail.paymentMethodName = "Ví MoMo";
        break;
      case 'bank':
        orderDetail.paymentMethodName = "Chuyển khoản ngân hàng";
        break;
      case 'zalopay':
        orderDetail.paymentMethodName = "ZaloPay";
        break;
      case 'vnpay':
        orderDetail.paymentMethodName = "VNPay";
        break;
    }

    switch(orderDetail.paymentStatus){
      case 'unpaid':
        orderDetail.paymentStatusName = "Chưa thanh toán";
        break;
      case 'paid':
        orderDetail.paymentStatusName = "Đã thanh toán";
        break;
    }

    switch(orderDetail.status){
      case 'initial':
        orderDetail.statusName = "Đã đặt";
        break;
      case 'done':
        orderDetail.statusName = "Đã đặt";
        break;
      case 'cancel':
        orderDetail.statusName = "Đã hủy";
        break;
    }

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format('HH:mm - DD/MM/YYYY');

    for(const item of orderDetail.items){
      const tourInfo = await Tour.findOne({
        _id: item.tourId
      });
      if(tourInfo){
        item.name = tourInfo.name;
        item.avatar = tourInfo.avatar;
        item.slug = tourInfo.slug;
        item.departureDateFormat = moment(tourInfo.departureDate).format('DD/MM/YYYY');

        const city = await City.findOne({
          _id: item.locationFrom
        });
        item.locationFromName = city.name;
      }
    }

    const customerId = res.locals.customer?.id || (res.locals.customer?._id ? String(res.locals.customer._id) : '');
    res.render('client/pages/order-success', {
      pageTitle: "Đặt hàng thành công",
      orderDetail: orderDetail,
      canCancel: Boolean(customerId && orderDetail.customerId === customerId && orderDetail.status !== 'cancel')
    });
  } else {
    res.redirect('/');
  }
}

module.exports.paymentZaloPay = async (req, res) => {
  const orderCode = req.query.code;
  const orderDetail = await Order.findOne({
    code: orderCode,
    deleted: false,
    paymentStatus: 'unpaid'
  });
  if(orderDetail){
    const apiZaloPay = `${process.env.ZALOPAY_DOMAIN}/v2/create`;
    const appid = process.env.ZALOPAY_APP_ID;
    const key1 = process.env.ZALOPAY_KEY_1;
    const transID = Math.floor(Math.random() * 1000000);

    const dataFinal = {
      app_id: appid,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, 
      app_user: `${orderDetail.phoneNumber}-${orderDetail.code}`,
      app_time: Date.now(), 
      item: JSON.stringify([{}]),
      embed_data: JSON.stringify({
        redirecturl: `${process.env.DOMAIN_WEBSITE}/order/success?code=${orderCode}&phoneNumber=${orderDetail.phoneNumber}`,
      }),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng ${orderDetail.code}`,
      bank_code: "",
      mac: "",
      callback_url: `${process.env.DOMAIN_WEBSITE}/order/payment-zalopay-result`,
    };

    const data = appid + "|" + dataFinal.app_trans_id + "|" + dataFinal.app_user + "|" + dataFinal.amount + "|" + dataFinal.app_time + "|" + dataFinal.embed_data + "|" + dataFinal.item;
    dataFinal.mac = CryptoJS.HmacSHA256(data, key1).toString();
    
    const response = await axios.post(apiZaloPay, null, { params: dataFinal });
    res.redirect(response.data.order_url);
  }
}

module.exports.paymentZalopayResultPost = async (req, res) => {
  const key2 = process.env.ZALOPAY_KEY_2;
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, key2).toString();

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    }
    else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, key2);
      // console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);
      const [phoneNumber, orderCode] = dataJson.app_user.split('-');
      await Order.updateOne({
        code: orderCode,
        phoneNumber: phoneNumber,
        deleted: false
      }, {
        paymentStatus: 'paid'
      });

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
  console.log('ZaloPay Payment Result:', req.body);
  return;
}

module.exports.paymentVnPay = async (req, res) => {
  const orderCode = req.query.code;

  const orderDetail = await Order.findOne({
    code: orderCode,
    deleted: false,
    paymentStatus: "unpaid"
  });

  if(orderDetail) {
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    
    let tmnCode = process.env.VNPAY_TMN_CODE;
    let secretKey = process.env.VNPAY_SECRET_KEY;
    let vnpUrl = process.env.VNPAY_API_URL;
    let returnUrl = `${process.env.DOMAIN_WEBSITE}/order/payment-vnpay-result`;
    let orderId = `${orderDetail.code}-${Date.now()}`;
    let amount = orderDetail.total;
    let bankCode = "";
    
    let locale = "vi";
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortHelper.sortObject(vnp_Params);

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");     
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.redirect(vnpUrl);
  }
}

module.exports.paymentVNpayResult = async (req, res) => {
  let vnp_Params = JSON.parse(JSON.stringify(req.query));

  let secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortHelper.sortObject(vnp_Params);

  let secretKey = process.env.VNPAY_SECRET_KEY;

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");     
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

  if(secureHash === signed){
    if(vnp_Params.vnp_ResponseCode == "00" && vnp_Params.vnp_TransactionStatus == "00") {
      const [ orderCode, date ] = vnp_Params.vnp_TxnRef.split("-");

      const orderDetail = await Order.findOneAndUpdate({
        code: orderCode,
        deleted: false
      }, {
        paymentStatus: "paid"
      });

      res.redirect(`${process.env.DOMAIN_WEBSITE}/order/success?code=${orderCode}&phoneNumber=${orderDetail.phoneNumber}`);
    }
  } else{
    res.render('success', {code: '97'})
  }
}
