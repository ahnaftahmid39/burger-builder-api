const router = require('express').Router();
const { PaymentSession } = require('ssl-commerz-node');
const path = require('path');
const { Order } = require('../models/orders');
const { Payment } = require('../models/payment');
const fetch = require('node-fetch');
const authorize = require('../middlewares/authorize');

const ipn = async (req, res) => {
  try {
    console.log(req.body);
    const payment = new Payment(req.body);
    console.log(payment);
    const tran_id = payment['tran_id'];

    if (payment['status'] === 'VALID') {
      const storeId = process.env.STORE_ID;
      const storePassword = process.env.STORE_PASSWORD;
      const val_id = payment['val_id'];

      const response = await fetch(
        `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${storeId}&store_passwd=${storePassword}&format=json`,
        {
          method: 'GET', // *GET, POST, PUT, DELETE, etc.
          mode: 'cors', // no-cors, cors, *same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          redirect: 'follow', // manual, *follow, error
          referrer: 'no-referrer', // no-referrer, *client
        }
      );
      const data = await response.json();
      if (data.status === 'VALID') {
        await Order.updateOne(
          { tran_id: tran_id },
          { orderStatus: 'Complete', paymentStatus: data.status }
        );
      } else {
        await Order.updateOne(
          { tran_id: tran_id },
          { orderStatus: 'Pending', paymentStatus: data.status }
        );
      }
    } else {
      await Order.updateOne(
        { tran_id: tran_id },
        { orderStatus: 'Pending', paymentStatus: payment['status'] }
      );
    }
    await payment.save();
    return res.status(200).send('IPN');
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Internal server error!');
  }
};

const initPayment = async (req, res) => {
  try {
    const profile = req.body.customer;
    const order = new Order(req.body);

    const { address1, address2, city, state, postcode, country, phone } =
      profile;

    const storeId = process.env.STORE_ID;
    const storePassword = process.env.STORE_PASSWORD;
    const payment = new PaymentSession(true, storeId, storePassword);

    const backendURL =
      process.env.HEROKU_URL || 'https://boiling-beyond-54079.herokuapp.com';
    // Set the urls
    payment.setUrls({
      success: `${backendURL}/api/payment/success`, // If payment Succeed
      fail: `${backendURL}/api/payment/failure`, // If payment failed
      cancel: `${backendURL}/api/payment/cancel`, // If user cancel payment
      ipn: `${backendURL}/api/payment/ipn`, // SSLCommerz will send http post request in this link
    });

    const tran_id =
      '_' + Math.random().toString(36).substr(2, 9) + new Date().getTime();
    // Set order details
    payment.setOrderInfo({
      total_amount: order.price, // Number field
      currency: 'BDT', // Must be three character string
      tran_id: tran_id, // Unique Transaction id
      emi_option: 0, // 1 or 0
    });

    // Set customer info
    payment.setCusInfo({
      name: req.user.name,
      email: req.user.email,
      add1: address1,
      add2: address2,
      city: city,
      state: state,
      postcode: postcode,
      country: country,
      phone: phone,
      fax: phone,
    });

    // Set shipping info
    payment.setShippingInfo({
      method: 'Courier', //Shipping method of the order. Example: YES or NO or Courier
      num_item: 1, // 1 burger at a time :)
      name: req.user.name,
      add1: address1,
      add2: address2,
      city: city,
      state: state,
      postcode: postcode,
      country: country,
    });

    // Set Product Profile
    payment.setProductInfo({
      product_name: 'Burgers',
      product_category: 'Food',
      product_profile: 'general',
    });

    const response = await payment.paymentInit();

    if (response.status === 'SUCCESS') {
      order.tran_id = tran_id;
      order.sessionKey = response['sessionKey'];
      await order.save();
    }
    return res.status(200).send(response);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Internal server error!');
  }
};

const paymentSuccess = async (req, res) => {
  res.sendFile(path.join(__baseDir + '/public/success.html'));
};

const paymentFailure = async (req, res) => {
  res.sendFile(path.join(__baseDir + '/public/failure.html'));
};

const paymentCancel = async (req, res) => {
  res.sendFile(path.join(__baseDir + '/public/cancel.html'));
};

router.route('/').post(authorize, initPayment);
router.route('/ipn').post(ipn);
router.route('/success').post(paymentSuccess);
router.route('/cancel').post(paymentCancel);
router.route('/failure').post(paymentFailure);

module.exports = router;
