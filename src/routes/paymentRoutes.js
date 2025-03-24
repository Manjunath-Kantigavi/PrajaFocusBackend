const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const authenticateUser = require('../middleware/authMiddleware');

const router = express.Router();

// Update route paths to match frontend calls
router.post('/create-order', authenticateUser, createOrder);
router.post('/verify-payment', authenticateUser, verifyPayment);

module.exports = router;