const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const authenticateAdmin = require("../middleware/roleMiddleware");
const JobScheme = require("../models/JobScheme");
const User = require("../models/User");

const router = express.Router();

// Get job schemes (Limited for free users)
router.get("/", authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if request is from admin
        if (user.role === 'admin' || req.query.isAdmin === 'true') {
            const allJobs = await JobScheme.find();
            return res.json(allJobs);
        }

        // For regular users, check subscription
        const isSubscribed = user.jobAlertSubscription && 
                           (user.subscriptionExpiresAt === null || new Date(user.subscriptionExpiresAt) > new Date());

        let jobSchemes;
        if (isSubscribed) {
            jobSchemes = await JobScheme.find();
        } else {
            jobSchemes = await JobScheme.find().limit(5);
        }

        res.json(jobSchemes);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



// Get single job scheme
router.get("/:id", authenticateAdmin, async (req, res) => {
    try {
        const jobScheme = await JobScheme.findById(req.params.id);
        if (!jobScheme) {
            return res.status(404).json({ message: "Job scheme not found" });
        }
        res.json(jobScheme);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// Admin: Add a new job scheme
router.post("/", authenticateAdmin, async (req, res) => {
    const { title, description, eligibility, applicationLink } = req.body;
    try {
        const newScheme = new JobScheme({ title, description, eligibility, applicationLink });
        await newScheme.save();
        res.status(201).json({ message: "Job scheme added", jobScheme: newScheme });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Admin: Update a job scheme
router.put("/:id", authenticateAdmin, async (req, res) => {
    try {
        const updatedScheme = await JobScheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Job scheme updated", jobScheme: updatedScheme });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Admin: Delete a job scheme
router.delete("/:id", authenticateAdmin, async (req, res) => {
    try {
        await JobScheme.findByIdAndDelete(req.params.id);
        res.json({ message: "Job scheme deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
