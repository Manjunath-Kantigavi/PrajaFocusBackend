const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Role field
  jobAlertSubscription: { type: Boolean, default: false }, // Subscription status
  subscriptionExpiresAt: { type: Date, default: null }, // Expiry date
});

module.exports = mongoose.model("User", userSchema);
