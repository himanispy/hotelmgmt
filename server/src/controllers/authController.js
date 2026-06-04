const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Helper to sign JWT using environment settings
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '90d'
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email address already registered.', 400));
    }

    const newUser = await User.create({
        name,
        email,
        password,
        phone,
        role: 'customer' // Secure fallback
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate request inputs
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // Retrieve user and select password hash explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
        return next(new AppError('Incorrect email or password.', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
});
