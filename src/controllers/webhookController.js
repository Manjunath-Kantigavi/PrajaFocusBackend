const crypto = require('crypto');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        
        // Verify webhook signature
        const hmac = crypto.createHmac('sha256', webhookSecret);
        hmac.update(JSON.stringify(req.body));
        const generatedSignature = hmac.digest('hex');
        
        if (generatedSignature !== signature) {
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const event = req.body;

        // Handle payment success event
        if (event.event === 'payment.captured') {
            const payment = await Payment.findOne({ 
                razorpay_order_id: event.payload.payment.entity.order_id 
            });

            if (payment) {
                // Create transaction record
                const transaction = new Transaction({
                    paymentId: payment._id,
                    userId: payment.userId,
                    userName: payment.userName,
                    amount: event.payload.payment.entity.amount / 100, // Convert from paise to rupees
                    status: 'success',
                    subscriptionDuration: payment.subscriptionDuration
                });

                await transaction.save();
                
                // Update user subscription
                await User.findByIdAndUpdate(payment.userId, {
                    subscriptionExpiresAt: new Date(Date.now() + payment.subscriptionDuration * 24 * 60 * 60 * 1000)
                });
            }
        }

        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
};