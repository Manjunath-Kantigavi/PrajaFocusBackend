const GovtBenefit = require("../models/govtBenefit");
const User = require("../models/User");
const sendWhatsAppMessage = require("../services/whatsappService");

exports.createGovtBenefit = async (req, res) => {
    try {
        const { title, department, description, eligibility, applicationLink, subscriptionRequired } = req.body;

        // Validate required fields
        if (!title || !department || !description || !eligibility || !applicationLink) {
            return res.status(400).json({ 
                message: "All fields are required",
                required: ["title", "department", "description", "eligibility", "applicationLink"]
            });
        }

        const newBenefit = new GovtBenefit({
            title,
            department,
            description,
            eligibility,
            applicationLink,
            subscriptionRequired: subscriptionRequired || false
        });

        await newBenefit.save();
        console.log("📝 New Government Benefit Created:", title);

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
                const message = `🎯 *New Government Scheme Alert from PrajaFocus* 🎯\n\n` +
                    `*${title}*\n\n` +
                    `📋 *Department:*\n${department}\n\n` +
                    `📝 *Description:*\n${description}\n\n` +
                    `✅ *Eligibility:*\n${eligibility}\n\n` +
                    `🔗 *How to Apply:*\n${applicationLink}\n\n` +
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
            message: "Government benefit added and notifications sent", 
            govtBenefit: newBenefit,
            subscribersNotified: subscribers.length 
        });
    } catch (error) {
        console.error("❌ Error adding benefit:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};