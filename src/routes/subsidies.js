const express = require("express");
const Subsidy = require("../models/subsidy");
const authenticateAdmin = require("../middleware/roleMiddleware");
const authenticateUser = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// ✅ Add a new subsidy (Admin only)
router.post("/", authenticateAdmin, async (req, res) => {
    const { name, department, description, moreDetailsLink } = req.body;

    try {
        const newSubsidy = new Subsidy({ name, department, description, moreDetailsLink });
        await newSubsidy.save();

        res.status(201).json({ message: "Subsidy added successfully", subsidy: newSubsidy });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Get all subsidies
router.get("/", authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if request is from admin
        if (user.role === 'admin' || req.query.isAdmin === 'true') {
            const allSubsidies = await Subsidy.find();
            return res.json(allSubsidies);
        }

        // Regular user logic continues here
        const isSubscribed = user.jobAlertSubscription && 
                           (user.subscriptionExpiresAt === null || new Date(user.subscriptionExpiresAt) > new Date());

        let subsidies;
        if (isSubscribed) {
            subsidies = await Subsidy.find();
        } else {
            subsidies = await Subsidy.find().limit(1);
        }

        res.json(subsidies);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


// ✅ Get a single subsidy by ID
router.get("/:id", async (req, res) => {
    try {
        const subsidy = await Subsidy.findById(req.params.id);
        if (!subsidy) {
            return res.status(404).json({ message: "Subsidy not found" });
        }
        res.json(subsidy);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Update a subsidy (Admin only)
router.put("/:id", authenticateAdmin, async (req, res) => {
    const { name, department, description, moreDetailsLink } = req.body;

    try {
        const updatedSubsidy = await Subsidy.findByIdAndUpdate(
            req.params.id,
            { name, department, description, moreDetailsLink },
            { new: true }
        );

        if (!updatedSubsidy) {
            return res.status(404).json({ message: "Subsidy not found" });
        }

        res.json(updatedSubsidy);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Delete a subsidy (Admin only)
router.delete("/:id", authenticateAdmin, async (req, res) => {
    try {
        const subsidy = await Subsidy.findByIdAndDelete(req.params.id);
        if (!subsidy) {
            return res.status(404).json({ message: "Subsidy not found" });
        }
        res.json({ message: "Subsidy deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
