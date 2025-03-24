const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const User = require('../models/User');
const Job = require('../models/JobScheme');
const GovtBenefit = require('../models/govtBenefit');
const Subsidy = require('../models/Subsidy');

const router = express.Router();

router.get("/stats", authenticateUser, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied. Admins only." });
    }

    try {
        const totalSubscribers = await User.countDocuments({ role: 'subscriber' });
        const activeJobs = await Job.countDocuments();
        const totalSchemes = await GovtBenefit.countDocuments(); // Changed from Scheme to GovtBenefit
        const totalSubsidies = await Subsidy.countDocuments();

        // Since Payment model isn't implemented yet, using static data
        const revenueData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [1000, 1500, 2000, 1800, 2200, 2500]
        };

        const subscriberData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            values: [10, 15, 20, 25, 30, 35]
        };

        res.json({
            totalSubscribers,
            monthlyRevenue: 0, // Set to 0 since Payment model isn't implemented
            activeJobs,
            totalSchemes,
            totalSubsidies,
            revenueData,
            subscriberData
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: "Error fetching dashboard statistics" });
    }
});

module.exports = router;
