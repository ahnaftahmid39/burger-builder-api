const express = require('express');
const router = express.Router();
const { Order } = require('../models/orders');
const authorize = require('../middlewares/authorize');

const getOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({
    orderTime: -1,
  });
  res.send(orders);
};

const addOrder = async (req, res) => {
  try {
    req.body.userId = req.user._id;
    const order = new Order(req.body);
    const result = await order.save();
    return res.status(201).send(result);
  } catch (err) {
    return res.status(400).send('Cannot process this order!');
  }
};

router.route('/').get(authorize, getOrders).post(authorize, addOrder);

module.exports = router;
