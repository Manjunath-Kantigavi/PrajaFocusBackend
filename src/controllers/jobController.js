const Job = require('../models/Job');
const User = require('../models/User');
const sendWhatsAppMessage = require('../services/whatsappService');

exports.createJob = async (req, res) => {
    try {
        // Create the job
        const job = await Job.create(req.body);

        // Find all subscribed users
        const subscribers = await User.find({ 
            jobAlertSubscription: true,
            $or: [
                { subscriptionExpiresAt: { $gt: new Date() } },
                { subscriptionExpiresAt: null }
            ]
        });

        console.log(`Found ${subscribers.length} subscribers to notify`);

        // Prepare WhatsApp message
        const message = `🚀 *New Job Alert* 🚀\n\n` +
            `*${job.title}*\n` +
            `📝 *Description:* ${job.description}\n` +
            `🎯 *Eligibility:* ${job.eligibility}\n` +
            `🔗 *Apply Here:* ${job.applicationLink}`;

        // Send WhatsApp messages to all subscribers
        for (const user of subscribers) {
            try {
                await sendWhatsAppMessage(user.phone, message);
                console.log(`Notification sent to: ${user.phone}`);
            } catch (error) {
                console.error(`Failed to send notification to ${user.phone}:`, error);
            }
        }

        res.status(201).json({
            success: true,
            message: "Job created and notifications sent",
            subscribersNotified: subscribers.length,
            job: job
        });

    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};
