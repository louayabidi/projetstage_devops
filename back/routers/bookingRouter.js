const express = require('express');
const router = express.Router();
const passport = require('../middlewares/passport');
const {
  createBooking,
  getOwnerBookings,
  makeOffer,
  acceptOffer,
  rejectOffer,
  getMessages,
  sendMessage,
  getBookingById,
  updatePassengerLocation,
} = require('../controllers/bookingController');

// Passenger creates booking
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  createBooking
);

// Boat owner gets booking requests
router.get(
  '/owner',
  passport.authenticate('jwt', { session: false }),
  getOwnerBookings
);

// Boat owner makes offer
router.post(
  '/:bookingId/offer',
  passport.authenticate('jwt', { session: false }),
  makeOffer
);

// Passenger accepts offer
router.post(
  '/:bookingId/accept',
  passport.authenticate('jwt', { session: false }),
  acceptOffer
);

// Passenger rejects offer
router.post(
  '/:bookingId/reject',
  passport.authenticate('jwt', { session: false }),
  rejectOffer
);

// Get messages for a booking
router.get(
  '/:bookingId/messages',
  passport.authenticate('jwt', { session: false }),
  getMessages
);

// Send message in booking chat
router.post(
  '/:bookingId/messages',
  passport.authenticate('jwt', { session: false }),
  sendMessage
);

// Get single booking by ID
router.get(
  '/:bookingId',
  passport.authenticate('jwt', { session: false }),
  getBookingById
);

// Update passenger location
router.put(
  '/:bookingId/location',
  passport.authenticate('jwt', { session: false }),
  updatePassengerLocation
);

module.exports = router;