const express = require('express');
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const orderRouter = require('./routers/orderRouter');
const paymentRouter = require('./routers/paymentRouter');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public'))
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/payment', paymentRouter);

module.exports = app;
