const mongoose = require("mongoose");

const subsidySchema = new mongoose.Schema({
    name: { type: String, required: true }, // Subsidy Name
    department: { type: String, required: true }, // Issuing Department
    description: { type: String, required: true }, // Brief Description
    moreDetailsLink: { type: String, required: true } // URL for more details
}, { timestamps: true });

module.exports = mongoose.model("Subsidy", subsidySchema);
