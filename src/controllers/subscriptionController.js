const User = require("../models/User");

const subscribeUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Simulate payment verification (Replace with real payment gateway logic)
        const paymentSuccess = true; 

        if (paymentSuccess) {
            user.jobAlertSubscription = true;
            user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days
            await user.save();

            return res.json({ message: "Subscription activated successfully!" });
        } else {
            return res.status(400).json({ message: "Payment failed!" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { subscribeUser };
