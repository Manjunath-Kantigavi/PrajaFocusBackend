const Subsidy = require("../models/subsidy");
const User = require("../models/User");
const sendWhatsAppMessage = require("../services/whatsappService");

exports.createSubsidy = async (req, res) => {
    const { name, department, description, moreDetailsLink } = req.body;

    try {
        const newSubsidy = new Subsidy({ name, department, description, moreDetailsLink });
        await newSubsidy.save();
        console.log("📝 New Subsidy Created:", name);

        // Find subscribers
        console.log("🔍 Finding subscribed users...");
        const subscribers = await User.find({ 
            jobAlertSubscription: true,
            $or: [
                { subscriptionExpiresAt: { $gt: new Date() } },
                { subscriptionExpiresAt: null }
            ]
        }).select('name phone jobAlertSubscription subscriptionExpiresAt');

        console.log("📱 Found subscribers:", subscribers.length);

        // Send notifications
        for (const user of subscribers) {
            try {
                const message = `🎯 *New Subsidy Alert from PrajaFocus* 🎯\n\n` +
                    `*${name}*\n\n` +
                    `📋 *Department:*\n${department}\n\n` +
                    `📝 *Description:*\n${description}\n\n` +
                    `🔗 *More Details:*\n${moreDetailsLink}\n\n` +
                    `--------------------------------\n` +
                    `Best Regards,\n` +
                    `Team PrajaFocus 🌟\n` +
                    `Your Gateway to Government Opportunities`;
                
                console.log(`📤 Sending notification to ${user.name} (${user.phone})`);
                await sendWhatsAppMessage(user.phone, message);
                console.log(`✅ Notification sent successfully to ${user.phone}`);
            } catch (error) {
                console.error(`❌ Failed to notify ${user.phone}:`, error);
            }
        }

        res.status(201).json({ 
            message: "Subsidy added and notifications sent", 
            subsidy: newSubsidy,
            subscribersNotified: subscribers.length 
        });
    } catch (error) {
        console.error("❌ Error adding subsidy:", error);
        res.status(500).json({ message: "Server error", error });
    }
};