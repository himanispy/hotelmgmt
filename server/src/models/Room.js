const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        unique: true
    },
    type: {
        type: String,
        enum: ['deluxe', 'executive', 'suite'],
        required: [true, 'Room type is required']
    },
    name: {
        type: String,
        required: [true, 'Room name is required']
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required']
    },
    capacity: {
        type: Number,
        required: [true, 'Room capacity is required']
    },
    amenities: {
        type: [String],
        default: []
    },
    images: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        trim: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
