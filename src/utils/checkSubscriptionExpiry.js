const User = require("../models/User");

const checkSubscriptionExpiry = async () => {
    const expiredUsers = await User.find({ 
        jobAlertSubscription: true, 
        subscriptionExpiresAt: { $lt: new Date() } 
    });

    for (const user of expiredUsers) {
        user.jobAlertSubscription = false;
        user.subscriptionExpiresAt = null;
        await user.save();
    }
};

module.exports = checkSubscriptionExpiry;
