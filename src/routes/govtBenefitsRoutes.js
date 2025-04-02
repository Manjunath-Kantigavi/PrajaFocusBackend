const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const authenticateAdmin = require("../middleware/roleMiddleware");
const GovtBenefit = require("../models/govtBenefit");
const User = require("../models/User");
const govtBenefitController = require("../controllers/govtBenefitController");

const router = express.Router();

router.get("/", authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        console.log("✅ User Data:", user);

        // Check if request is from admin
        const isAdmin = req.query.isAdmin === 'true';

        // If admin, return all schemes without filtering
        if (isAdmin) {
            const benefits = await GovtBenefit.find();
            return res.json(benefits);
        }

        // For regular users, check subscription
        const isSubscribed = user.jobAlertSubscription === true &&
            (user.subscriptionExpiresAt === null || new Date(user.subscriptionExpiresAt) > new Date());

        console.log("🔍 Subscription Check:", isSubscribed);

        console.log("🔎 Fetching Benefits from DB...");
        let benefits;
        if (isSubscribed) {
            benefits = await GovtBenefit.find();
        } else {
            benefits = await GovtBenefit.find({ $or: [{ subscriptionRequired: false }, { subscriptionRequired: { $exists: false } }] }).limit(5);
        }

        return res.json(benefits);
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



// Add this route after the main GET route
router.get("/:id", authenticateAdmin, async (req, res) => {
    try {
        const benefit = await GovtBenefit.findById(req.params.id);
        if (!benefit) {
            return res.status(404).json({ message: "Benefit not found" });
        }
        res.json(benefit);
    } catch (error) {
        console.error("❌ Error fetching benefit:", error);
        res.status(500).json({ message: "Server error", error });
    }
});




// Admin: Add a new government benefit
router.post("/", authenticateAdmin, govtBenefitController.createGovtBenefit);


// Admin: Update a government benefit
// Update the existing PUT route
router.put("/:id", authenticateAdmin, async (req, res) => {
    try {
        const { title, department, description, eligibility, applicationLink, subscriptionRequired } = req.body;

        // Validate required fields
        if (!title || !department || !description || !eligibility || !applicationLink) {
            return res.status(400).json({ 
                message: "All fields are required",
                required: ["title", "department", "description", "eligibility", "applicationLink"]
            });
        }

        const updatedBenefit = await GovtBenefit.findByIdAndUpdate(
            req.params.id, 
            {
                title,
                department,
                description,
                eligibility,
                applicationLink,
                subscriptionRequired: subscriptionRequired || false
            },
            { new: true, runValidators: true }
        );

        if (!updatedBenefit) {
            return res.status(404).json({ message: "Benefit not found" });
        }

        res.json({ message: "Government benefit updated", govtBenefit: updatedBenefit });
    } catch (error) {
        console.error("❌ Error updating benefit:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Admin: Delete a government benefit
router.delete("/:id", authenticateAdmin, async (req, res) => {
    try {
        await GovtBenefit.findByIdAndDelete(req.params.id);
        res.json({ message: "Government benefit deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
