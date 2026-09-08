const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));

app.use('/api/products', require('./routes/productRoutes'));

app.use('/api/cart', require('./routes/cart'));

app.use('/api/orders', require('./routes/orderRoutes'));

app.use('/api/payment', require('./routes/paymentRoutes'));

// MongoDB Connection
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'
)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Root Route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
