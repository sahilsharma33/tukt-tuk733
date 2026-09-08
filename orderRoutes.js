const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/create', async (req, res) => {

  try {

    const order = new Order(req.body);

    await order.save();

    res.json({
      success: true,
      message: 'Order Placed',
      order
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }

});
router.get('/', async (req, res) => {

    try {

        const orders = await Order.find();

        res.json(orders);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
});
module.exports = router;