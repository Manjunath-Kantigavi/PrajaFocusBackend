const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

console.log('Razorpay Config:', {
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID.trim(),
    key_secret: process.env.RAZORPAY_KEY_SECRET.trim()
});

const createOrder = async (req, res) => {
    try {
        const { amount, planType, duration } = req.body;

        const options = {
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.json({
            key_id: process.env.RAZORPAY_KEY_ID,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Order creation failed:', error);
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            planType,
            duration,
            amount
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        // Update user subscription
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate expiration date based on plan duration
        const durationMap = {
            '1 Month': 30,
            '6 Months': 180,
            '1 Year': 365
        };

        const days = durationMap[duration] || 30;
        user.jobAlertSubscription = true;
        user.subscriptionExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        await user.save();

        res.json({ 
            message: 'Payment verified and subscription updated',
            expiresAt: user.subscriptionExpiresAt
        });
    } catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};

module.exports = { createOrder, verifyPayment };