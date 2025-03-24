const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin/dashboard", authenticateUser, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied. Admins only." });
    }

    res.json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

module.exports = router;
