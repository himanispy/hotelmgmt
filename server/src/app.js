const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const AppError = require('./utils/AppError');

const app = express();

// 1. Mount Global Middlewares
app.use(cors()); // Allow cross-origin client connections
app.use(express.json()); // Body parser

// 2. API Endpoints Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// 3. Fallback Route for undefined endpoints
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4. Register Global Error Handler Middleware
app.use(errorMiddleware);

module.exports = app;
