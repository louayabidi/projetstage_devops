const express = require('express');
const router = express.Router();
const passport = require('../middlewares/passport');
const {
  createBooking,
  getOwnerBookings,
  makeOffer,
  acceptOffer,
  getMessages,
  sendMessage
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

module.exports = router;