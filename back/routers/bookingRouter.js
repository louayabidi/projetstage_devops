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
  getWeather,
  getBoatOwnerReviews,
  submitReview,
  getPassengerBookings,

} = require('../controllers/bookingController');



router.get(
  '/passenger',
  passport.authenticate('jwt', { session: false }),
  getPassengerBookings
);

router.post(
  '/:bookingId/review',
  passport.authenticate('jwt', { session: false }),
  submitReview
);

// Get reviews for a boat owner
router.get(
  '/boat-owner/:boatOwnerId/reviews',
  passport.authenticate('jwt', { session: false }),
  getBoatOwnerReviews
);

// Get weather for a location
router.get(
  '/weather',
  passport.authenticate('jwt', { session: false }),
  getWeather
);


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