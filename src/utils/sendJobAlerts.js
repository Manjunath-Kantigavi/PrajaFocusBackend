const nodemailer = require("nodemailer");
const User = require("../models/User");

const sendJobAlerts = async (job) => {
    const subscribers = await User.find({ jobAlertSubscription: true });

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    for (const user of subscribers) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email, // Ensure email exists in User model
            subject: "New Job Alert!",
            text: `A new job is available: ${job.title}. Apply here: ${job.link}`
        };

        await transporter.sendMail(mailOptions);
    }
};

module.exports = sendJobAlerts;
