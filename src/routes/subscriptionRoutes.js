const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const { subscribeUser } = require("../controllers/subscriptionController");

const router = express.Router();

router.post("/subscribe", authenticateUser, subscribeUser);

module.exports = router;
