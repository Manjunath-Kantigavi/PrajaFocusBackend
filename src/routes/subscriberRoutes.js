const express = require("express");
const router = express.Router();
const authenticateAdmin = require("../middleware/roleMiddleware");
const User = require("../models/User");

// Get all subscribers (Admin only)
router.get("/", authenticateAdmin, async (req, res) => {
    try {
        const subscribers = await User.find({ role: "user" }).select('name phone jobAlertSubscription subscriptionExpiresAt');
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching subscribers", error: error.message });
    }
});

// Delete subscriber (Admin only)
router.delete("/:id", authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Subscriber not found" });
        }
        res.json({ message: "Subscriber deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting subscriber", error: error.message });
    }
});

module.exports = router;