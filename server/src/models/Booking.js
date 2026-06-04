const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: [true, 'Booking reference ID is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Booking must select a room']
    },
    checkinDate: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkoutDate: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    nights: {
        type: Number,
        required: [true, 'Number of nights is required']
    },
    baseSubtotal: {
        type: Number,
        required: [true, 'Base subtotal is required']
    },
    weekendSurge: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        required: [true, 'GST tax calculation is required']
    },
    grandTotal: {
        type: Number,
        required: [true, 'Grand total is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    }
}, { timestamps: true });

// Indexing check-in/check-out fields to run fast overlap queries
bookingSchema.index({ room: 1, checkinDate: 1, checkoutDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
