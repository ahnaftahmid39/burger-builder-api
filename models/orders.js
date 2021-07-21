const { Schema, model } = require('mongoose');

const orderSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId },
    ingredients: [{ type: { type: String }, amount: { type: Number } }],
    customer: {
      deliveryAddress: { type: String },
      phone: { type: String },
      paymentType: { type: String },
    },
    price: { type: Number },
    orderTime: { type: Date, default: Date.now() },
    orderStatus: {
      type: String,
      default: 'Pending',
      enum: ['Pending', 'Completed'],
    },
    paymentStatus: {
      type: String,
      default: 'Not validated yet',
    },
    tran_id: {
      type: String,
      unique: true,
    },
    sessionKey: {
      type: String,
    }
  },
  { timestamps: true }
);

const Order = model('Order', orderSchema);

module.exports.Order = Order;

/*
{
	"userId" : "60aca32e96d6a30c64a6e7c6",
	"ingredients" : [
		{ "type" : "salad", "amount" : 2 },
		{ "type": "meat", "amount": 3 }
	],
	"customer" : {
		"deliveryAddress" : "senpara, dhaka",
		"phone" : "+8801988603156",
		"paymentType": "BKash"
	},
	"price" : 330
}
clZqCJjh9KPgVm0l
*/