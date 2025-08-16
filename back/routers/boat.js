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


// Create a new route to update boat locations
router.post('/update-boat-locations', async (req, res) => {
  try {
    // Tunisia coordinates
    const tunisiaCoords = [
      { name: "Tunis", coords: [10.181667, 36.806389] },
      { name: "Sfax", coords: [10.766667, 34.733333] },
      { name: "Sousse", coords: [10.641111, 35.825556] }
    ];

    // Get all boats
    const boats = await Boat.find();
    
    // Update each boat with a random Tunisia location
    for (let i = 0; i < boats.length; i++) {
      const randomLocation = tunisiaCoords[Math.floor(Math.random() * tunisiaCoords.length)];
      boats[i].location = {
        type: 'Point',
        coordinates: randomLocation.coords
      };
      await boats[i].save();
      console.log(`Updated ${boats[i].name} location to ${randomLocation.name}`);
    }

    res.json({ success: true, message: `Updated ${boats.length} boat locations` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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

router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  createBoat
);
router.get('/', getBoats);
router.get('/:id', getBoat);
router.delete('/:id', deleteBoat);

module.exports = router;