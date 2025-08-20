// routers/userRouter.js
const express = require('express');
const router = express.Router();
const passport = require('../middlewares/passport'); 
const multer = require('multer');
const upload = multer({ dest: 'uploads/profiles/' });

const {
	getAllUsers,
  updateCurrentUser,
	deleteUser,
  uploadProfileImage,
  getCurrentUser,
  getAllBoatOwners,
  
	
} = require('../controllers/userController');




router.post('/upload-profile',
  passport.authenticate('jwt', { session: false }),
  upload.single('profile'),
  uploadProfileImage
);

router.get('/', getAllUsers);



router.patch('/me',
  passport.authenticate('jwt', { session: false }),
  upload.single('photo'), 
  updateCurrentUser
);

// Add this to your userRouter.js
router.get('/test', 
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('Test endpoint - User authenticated:', req.user);
    res.json({ 
      success: true, 
      message: 'JWT authentication working',
      user: req.user 
    });
  }
);


router.get('/boat-owners', 
  passport.authenticate('jwt', { session: false }),
  getAllBoatOwners
);

router.get('/me', 
  passport.authenticate('jwt', { session: false }), 
  getCurrentUser
);

// Delete user
router.delete('/:id', deleteUser);

module.exports = router;
