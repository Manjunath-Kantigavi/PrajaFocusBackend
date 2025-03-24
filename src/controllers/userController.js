const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const newUser = new User({ name, phone });
    await newUser.save();

    return res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const loginUser = async (req, res) => {
  const { phone } = req.body;

  try {
      const user = await User.findOne({ phone });

      if (!user) {
          return res.status(401).json({ message: "User not found!" });
      }

      const token = jwt.sign(
          { 
              userId: user._id, 
              phone: user.phone, 
              role: user.role
          },
          process.env.JWT_SECRET, 
          { expiresIn: "7d" }
      );

      // Include user details in response
      res.json({ 
          message: "Login successful!", 
          token,
          user: {
              name: user.name,
              phone: user.phone,
              role: user.role
          }
      });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
};


module.exports = { registerUser, loginUser };
