const express = require('express');
const { createBoat, getBoats, getBoat, updateBoat, deleteBoat } = require('../controllers/boatController');
const passport = require('../middlewares/passport');
const boatController = require('../controllers/boatController');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();


router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});


router.post('/nearby-boats', passport.authenticate('jwt', { session: false }), boatController.getNearbyBoats);
router.put('/complete-info', passport.authenticate('jwt', { session: false }), boatController.completeBoatInfo);
router.get('/my-boat', passport.authenticate('jwt', { session: false }), boatController.getBoatByOwner);
router.get('/:boatId/license', passport.authenticate('jwt', { session: false }), boatController.downloadBoatLicense);
router.put('/my-boat', passport.authenticate('jwt', { session: false }), boatController.updateBoat);
router.post('/add', passport.authenticate('jwt', { session: false }), createBoat);
router.patch('/location', authenticate, boatController.updateBoatLocation);
router.get('/locations', boatController.getBoatLocations);


router.get('/', getBoats);
router.get('/:id', getBoat); 
router.delete('/:id', deleteBoat);

module.exports = router;