const dotenv = require('dotenv');
const path = require('path');

// Catch synchronous exceptions before any imports
process.on('uncaughtException', err => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

// Load configuration variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB Database
connectDB();

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log(`🚀 AetherStay API running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${port}`);
});

// Catch asynchronous promise rejections
process.on('unhandledRejection', err => {
    console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
