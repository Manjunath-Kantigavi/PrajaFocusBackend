require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db.js"); // Import DB connection
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request body
// Update CORS configuration
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
connectDB();
// Test Route
app.get("/", (req, res) => {
  res.send("Prajafocus Backend is Running!");
});

// Routes
const userRoutes = require("./src/routes/userRoutes"); // Ensure the correct path
const protectedRoutes = require("./src/routes/protectedRoutes"); // Ensure the correct path

app.use("/api/users", userRoutes);
app.use("/api", protectedRoutes);

// Admin Routes
const adminRoutes = require("./src/routes/adminRoutes"); // Ensure the path is correct
app.use("/admin", adminRoutes);

//Job Scheme and Govt Benefit Routes
app.use("/jobschemes", require("./src/routes/jobSchemeRoutes"));
app.use("/govtbenefits", require("./src/routes/govtBenefitsRoutes"));

// Subscription Routes
const subscriptionRoutes = require("./src/routes/subscriptionRoutes");
app.use("/api/subscription", subscriptionRoutes);

// Subsidy Routes
const subsidyRoutes = require("./src/routes/subsidies");
app.use("/api/subsidies", subsidyRoutes);

// Payment Routes
const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/api', paymentRoutes);

// Subscriber Routes
const subscriberRoutes = require("./src/routes/subscriberRoutes");
app.use("/api/subscribers", subscriberRoutes); // Add this line to mount the routes

// Start Server
const PORT = process.env.PORT || 5008;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
