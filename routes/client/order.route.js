const router = require('express').Router();
const orderController = require('../../controllers/client/order.controller');

router.post('/create', orderController.createPost);

router.get('/success', orderController.success);

router.get('/payment-zalopay', orderController.paymentZaloPay);
router.get('/payment-vnpay', orderController.paymentVnPay);

router.post('/payment-zalopay-result', orderController.paymentZalopayResultPost);

router.get('/payment-vnpay-result', orderController.paymentVNpayResult);

module.exports = router;