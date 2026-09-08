const express = require('express');
const Razorpay = require('razorpay');

const router = express.Router();


router.post('/create-order', async (req, res) => {

    const options = {
        amount: req.body.amount * 100,
        currency: 'INR',
        receipt: 'receipt_order'
    };

    try {

        const order = await razorpay.orders.create(options);

        res.json(order);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;