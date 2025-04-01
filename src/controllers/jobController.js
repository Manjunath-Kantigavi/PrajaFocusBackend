const Job = require('../models/Job');
const User = require('../models/User');
const sendWhatsAppMessage = require('../services/whatsappService');

exports.createJob = async (req, res) => {
    try {
        const job = await Job.create(req.body);
        console.log("Job created:", job._id);

        // Find subscribers
        const subscribers = await User.find({ 
            jobAlertSubscription: true,
            $or: [
                { subscriptionExpiresAt: { $gt: new Date() } },
                { subscriptionExpiresAt: null }
            ]
        });
        console.log(`Found ${subscribers.length} active subscribers`);

        // Send notifications
        for (const user of subscribers) {
            try {
                const message = `🚀 *New Job Alert* 🚀\n\n*${job.title}*\n📝 *Description:* ${job.description}\n🎯 *Eligibility:* ${job.eligibility}\n🔗 *Apply Here:* ${job.applicationLink}`;
                
                console.log(`Sending notification to ${user.phone}`);
                await sendWhatsAppMessage(user.phone, message);
                console.log(`✅ Notification sent to ${user.phone}`);
            } catch (error) {
                console.error(`Failed to notify ${user.phone}:`, error);
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
