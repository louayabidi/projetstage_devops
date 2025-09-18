
const express = require('express');
const router = express.Router();
const passport = require('../middlewares/passport');
const {
  createTravelInterest,
  getSuggestedCompanions,
  getMyTravelInterests,
  deactivateTravelInterest,
  getPredefinedInterests
} = require('../controllers/travelInterestController');

// Create a new travel interest
router.post(
  '/travel-interests',
  passport.authenticate('jwt', { session: false }),
  createTravelInterest
);

// Get suggested travel companions
router.get(
  '/suggestions',
  passport.authenticate('jwt', { session: false }),
  getSuggestedCompanions
);

// Get user's own travel interests
router.get(
  '/my',
  passport.authenticate('jwt', { session: false }),
  getMyTravelInterests
);



router.get(
  '/predefined',
  passport.authenticate('jwt', { session: false }),
  getPredefinedInterests
);
// Deactivate a travel interest
router.put(
  '/:id/deactivate',
  passport.authenticate('jwt', { session: false }),
  deactivateTravelInterest
);

module.exports = router;
