const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }
  ],

  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    pincode: String,
    phone: String
  },

  totalPrice: Number,

  paymentMethod: {
    type: String,
    default: 'COD'
  },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },

  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered'],
    default: 'Processing'
  }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);