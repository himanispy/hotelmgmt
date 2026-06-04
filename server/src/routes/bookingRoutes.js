const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Guard all booking endpoints under JWT authorization check
router.use(authMiddleware.protect);

router.post('/', bookingController.createBooking);

// Restrict viewing list of all reservations to operators only
router.get(
    '/',
    authMiddleware.restrictTo('admin', 'manager', 'receptionist'),
    bookingController.getAllBookings
);

module.exports = router;
