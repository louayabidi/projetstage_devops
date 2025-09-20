// backend/routers/boat.js
const express = require('express');
const { createBoat, getBoats, getBoat, updateBoat, deleteBoat } = require('../controllers/boatController');
const passport = require('../middlewares/passport');
const boatController = require('../controllers/boatController');
const { authenticate } = require('../middlewares/auth'); // Correct path
const router = express.Router();

const Boat = require('../models/boat');
// Location routes
router.patch('/location', authenticate, boatController.updateBoatLocation);
router.get('/locations', boatController.getBoatLocations);



// Debug middleware
router.use((req, res, next) => {
  console.log('Incoming headers:', req.headers);
  next();
});

// Existing routes
router.put(
  '/complete-info',
  passport.authenticate('jwt', { session: false }),
  boatController.completeBoatInfo
);


router.get(
  '/my-boat',
  passport.authenticate('jwt', { session: false }),
  boatController.getBoatByOwner
);


router.get('/:boatId/license', passport.authenticate('jwt', { session: false }),
  boatController.downloadBoatLicense
);


router.put(
  '/my-boat',
  passport.authenticate('jwt', { session: false }),
  boatController.updateBoat
);

router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  createBoat
);
router.get('/', getBoats);
router.get('/:id', getBoat);
router.delete('/:id', deleteBoat);

module.exports = router;