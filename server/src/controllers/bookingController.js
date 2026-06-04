const Booking = require('../models/Booking');
const Room = require('../models/Room');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createBooking = catchAsync(async (req, res, next) => {
    const { roomId, checkin, checkout } = req.body;

    if (!roomId || !checkin || !checkout) {
        return next(new AppError('Please provide roomId, checkin, and checkout dates.', 400));
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkinDate < today) {
        return next(new AppError('Check-in date cannot be in the past.', 400));
    }

    if (checkoutDate <= checkinDate) {
        return next(new AppError('Check-out date must be after check-in date.', 400));
    }

    // 1. Find target room
    const room = await Room.findById(roomId);
    if (!room) {
        return next(new AppError('No room found with that ID.', 404));
    }

    if (!room.isAvailable) {
        return next(new AppError('This room is currently out of service.', 400));
    }

    // 2. Query date overlap constraints
    const overlappingBookings = await Booking.find({
        room: roomId,
        status: { $ne: 'cancelled' },
        $or: [
            { checkinDate: { $lt: checkoutDate }, checkoutDate: { $gt: checkinDate } }
        ]
    });

    if (overlappingBookings.length > 0) {
        return next(new AppError('This room is already reserved for the selected dates.', 409));
    }

    // 3. Date calculations
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round((checkoutDate - checkinDate) / msPerDay);

    // 4. Rate pricing calculations (including weekend 25% surge)
    let baseSubtotal = 0;
    let weekendSurge = 0;
    const tempDate = new Date(checkinDate);

    for (let i = 0; i < nights; i++) {
        const dayOfWeek = tempDate.getDay(); // 5 = Friday, 6 = Saturday
        if (dayOfWeek === 5 || dayOfWeek === 6) {
            const surge = Math.round(room.basePrice * 0.25);
            weekendSurge += surge;
            baseSubtotal += room.basePrice;
        } else {
            baseSubtotal += room.basePrice;
        }
        tempDate.setDate(tempDate.getDate() + 1);
    }

    const subtotal = baseSubtotal + weekendSurge;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const grandTotal = subtotal + tax;

    // 5. Generate random booking reference ID
    const bookingId = `AST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Save reservation to database
    const booking = await Booking.create({
        bookingId,
        user: req.user._id,
        room: room._id,
        checkinDate,
        checkoutDate,
        nights,
        baseSubtotal: baseSubtotal,
        weekendSurge,
        tax,
        grandTotal,
        status: 'confirmed', // Confirmed directly for this setup
        paymentStatus: 'paid' // Simulated as paid directly
    });

    res.status(201).json({
        status: 'success',
        data: {
            booking
        }
    });
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
    // Populate user details and room specs
    const bookings = await Booking.find()
        .populate({ path: 'user', select: 'name email phone' })
        .populate({ path: 'room', select: 'roomNumber type name' });

    res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
            bookings
        }
    });
});
