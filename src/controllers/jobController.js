const JobScheme = require('../models/JobScheme');
const User = require('../models/User');
const sendWhatsAppMessage = require('../services/whatsappService');

exports.createJob = async (req, res) => {
    try {
        const job = await JobScheme.create(req.body);
        console.log("📝 New Job Created:", job.title);

        // Find subscribers with detailed logging
        console.log("🔍 Finding subscribed users...");
        const subscribers = await User.find({ 
            jobAlertSubscription: true,
            $or: [
                { subscriptionExpiresAt: { $gt: new Date() } },
                { subscriptionExpiresAt: null }
            ]
        }).select('name phone jobAlertSubscription subscriptionExpiresAt');

        console.log("📱 Found subscribers:", subscribers.map(s => ({
            name: s.name,
            phone: s.phone,
            subscriptionActive: s.jobAlertSubscription,
            expiresAt: s.subscriptionExpiresAt
        })));

        // Send notifications
        for (const user of subscribers) {
            try {
                const message = `🚀 *New Job Alert* 🚀\n\n*${job.title}*\n📝 *Description:* ${job.description}\n🎯 *Eligibility:* ${job.eligibility}\n🔗 *Apply Here:* ${job.applicationLink}`;
                
                console.log(`📤 Sending notification to ${user.name} (${user.phone})`);
                await sendWhatsAppMessage(user.phone, message);
                console.log(`✅ Notification sent successfully to ${user.phone}`);
            } catch (error) {
                console.error(`❌ Failed to notify ${user.phone}:`, error);
            }
        }

        res.status(201).json({
            success: true,
            message: "Job created and notifications sent",
            subscribersNotified: subscribers.length,
            job: job
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
