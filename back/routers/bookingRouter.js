const express = require('express');
const router = express.Router();
const passport = require('../middlewares/passport');
const Boat = require('../models/boat');
const User = require('../models/usersModel');
const Booking = require('../models/bookingModel');
const {
  createBooking,
  getOwnerBookings,
  makeOffer,
  acceptOffer,
  notifyAllBoatOwners
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


// routes/bookingRouter.js
router.get('/debug', async (req, res) => {
  try {
    // Find all boats
    const boats = await Boat.find();
    
    // Find all users
    const users = await User.find();
    
    // Get latest booking
    const booking = await Booking.findOne().sort({ createdAt: -1 });
    
    res.json({
      boats,
      users,
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get(
  '/listbooking',
  passport.authenticate('jwt', { session: false }),
  notifyAllBoatOwners
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

module.exports = router;