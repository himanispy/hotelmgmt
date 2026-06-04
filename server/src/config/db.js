const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/aetherstay';
        const conn = await mongoose.connect(dbUrl);
        console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`💥 Database connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
