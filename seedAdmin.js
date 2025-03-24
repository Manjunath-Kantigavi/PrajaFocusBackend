const connectDB = require("./src/config/db.js");
const User = require("./src/models/User");

connectDB();

async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ phone: "9876543210" });
    if (!existingAdmin) {
      const adminUser = new User({
        name: "Admin User",
        phone: "9876543210",
        role: "admin",
        createdAt: new Date()
      });

      await adminUser.save();
      console.log("✅ Admin user inserted successfully");
    } else {
      console.log("⚠️ Admin user already exists.");
    }
  } catch (error) {
    console.error("❌ Error inserting admin user:", error);
  } finally {
    process.exit(); // Exit the script after execution
  }
}

// Run the function
createAdminUser();
