const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// In-memory cart storage (use database in production)
const carts = {};

// Get cart
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const cart = carts[userId] || { items: [], total: 0 };
  res.json(cart);
});

// Add to cart
router.post('/add', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, productName, price, quantity } = req.body;
    
    if (!carts[userId]) {
      carts[userId] = { items: [], total: 0 };
    }
    
    const existingItem = carts[userId].items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      carts[userId].items.push({ productId, productName, price, quantity });
    }
    
    carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json(carts[userId]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove from cart
router.post('/remove', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    
    if (carts[userId]) {
      carts[userId].items = carts[userId].items.filter(item => item.productId !== productId);
      carts[userId].total = carts[userId].items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    res.json(carts[userId] || { items: [], total: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Clear cart
router.post('/clear', authMiddleware, (req, res) => {
  const userId = req.user.id;
  carts[userId] = { items: [], total: 0 };
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
