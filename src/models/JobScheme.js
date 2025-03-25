const mongoose = require("mongoose");

const jobSchemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    applicationLink: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("JobScheme", jobSchemeSchema);
