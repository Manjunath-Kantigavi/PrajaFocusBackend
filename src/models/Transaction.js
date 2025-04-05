const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    transactionId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'razorpay'
    },
    subscriptionDuration: {
        type: Number,  // Duration in days
        required: true
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model("Transaction", transactionSchema);