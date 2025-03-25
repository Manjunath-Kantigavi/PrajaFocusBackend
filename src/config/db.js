require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
