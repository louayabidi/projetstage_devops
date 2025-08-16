const Boat = require('../models/boat');
const User  = require('../models/usersModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/boats');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/boats/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
}).array('photos', 10);

exports.createBoat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, amenities, photos, boatType, boatCapacity, boatLicense } = req.body;

    if (!name || !boatType || !boatCapacity || !boatLicense) {
      return res.status(400).json({
        success: false,
        message: 'All boat fields are required'
      });
    }

    let boat = await Boat.findOne({ owner: userId });

    if (boat) {
      boat = await Boat.findOneAndUpdate(
        { owner: userId },
        {
          name,
          boatType,
          boatCapacity,
          boatLicense,
          amenities: Array.isArray(amenities) ? amenities : [],
          photos: Array.isArray(photos) ? photos : [],
          isVerified: true
        },
        { new: true }
      );
    } else {
      boat = new Boat({
        owner: userId, // Fixed to use userId instead of savedUser.userId
        name,
        boatType,
        boatCapacity,
        boatLicense,
        amenities: Array.isArray(amenities) ? amenities : [],
        photos: Array.isArray(photos) ? photos : [],
        isVerified: true
      });
      await boat.save();
    }

    await User.findByIdAndUpdate(
      userId,
      { boatInfoComplete: true },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Boat information saved successfully',
      boat
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.updateBoatLocation = async (req, res) => {
  try {
    const { boatId, latitude, longitude } = req.body;
    const user = req.user;
    const boat = await Boat.findById(boatId);
    if (!boat || boat.owner.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    boat.location = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    boat.lastLocationUpdate = new Date();
    await boat.save();

    res.status(200).json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getBoatLocations = async (req, res) => {
  try {
    const boats = await Boat.find()
      .select('name location boatType boatCapacity')
      .populate('owner', 'firstName lastName'); // Populate owner details
    console.log('Fetched boats:', boats); // Debug log
    res.status(200).json({ success: true, boats });
  } catch (error) {
    console.error('Fetch boat locations error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Read
exports.getBoats = async (req, res) => {
  try {
    const boats = await Boat.find();
    res.json(boats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read one

exports.getBoat = async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id).populate({
      path: 'owner',
      select: 'firstName lastName avatar createdAt' // Make sure these fields exist in User model
    });
    
    if (!boat) return res.status(404).json({ message: 'Boat not found' });

    // If owner exists but doesn't have name fields, add a default
    const boatObj = boat.toObject();
    if (boatObj.owner) {
      boatObj.owner.name = boatObj.owner.firstName 
        ? `${boatObj.owner.firstName} ${boatObj.owner.lastName || ''}`.trim()
        : 'Boat Owner';
    }

    res.json(boatObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeBoatInfo = [
  upload,
  async (req, res) => {
    try {
      console.log('Authenticated user:', req.user); // Debug log
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authenticated' 
        });
      }

      const userId = req.user.userId; // Use userId from token
      const { name, boatType, boatCapacity, boatLicense } = req.body;

      // Parse amenities safely
      let amenities = [];
      try {
        amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];
      } catch (e) {
        console.error('Error parsing amenities:', e);
      }

      // Validate required fields
      if (!name || !boatType || !boatCapacity || !boatLicense) {
        return res.status(400).json({
          success: false,
          message: 'All boat fields are required'
        });
      }

      // Get uploaded files
      const photos = req.files ? req.files.map(file => `/uploads/boats/${file.filename}`) : [];

      // Create or update boat
      const updatedBoat = await Boat.findOneAndUpdate(
        { owner: userId },
        {
          name,
          boatType,
          boatCapacity: Number(boatCapacity),
          boatLicense,
          amenities,
          photos,
          isVerified: false
        },
        { 
          new: true,
          upsert: true
        }
      );

      // Update user's boat info status
      await User.findOneAndUpdate(
        { userId: userId },
        { boatInfoComplete: true },
        { new: true }
      );

      return res.json({
        success: true,
        message: 'Boat information submitted successfully',
        boat: updatedBoat
      });

    } catch (error) {
      console.error('CompleteBoatInfo error:', error);
      
      // Clean up uploaded files if error occurs
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          try {
            fs.unlinkSync(path.join(uploadDir, file.filename));
          } catch (err) {
            console.error('Error cleaning up file:', err);
          }
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Server error updating boat info',
        error: error.message
      });
    }
  }
];


// Update
exports.updateBoat = async (req, res) => {
  console.log('=== UPDATE BOAT CONTROLLER STARTED ===');
  try {
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);

   const userId = req.user.userId; // Changed from req.user.userId
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }


    const { name, amenities, photos } = req.body;
    console.log('Extracted data:', { name, amenities, photos });

    if (!name) {
      console.log('Validation failed - no name');
      return res.status(400).json({
        success: false,
        message: 'Boat name required'
      });
    }

    console.log('Searching for boat with owner:', req.user.userId);
    const updatedBoat = await Boat.findOneAndUpdate(
      { owner: userId },
      {
        name,
        amenities: Array.isArray(amenities) ? amenities : [],
        photos: Array.isArray(photos) ? photos : [],
        isVerified: true
      },
      { new: true, runValidators: true }
    ).lean(); // Add .lean() for better logging

    console.log('Update result:', updatedBoat);

    if (!updatedBoat) {
      console.log('No boat found for user');
      return res.status(404).json({
        success: false,
        message: 'No boat found for this user'
      });
    }

    console.log('Updating user boatInfoComplete status');
    await User.findByIdAndUpdate(
      req.user.userId, 
      { boatInfoComplete: true },
      { new: true }
    );

    console.log('Sending success response');
    return res.json({
      success: true,
      message: 'Boat updated successfully',
      boat: updatedBoat
    });

  } catch (error) {
    console.error('Controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


// Delete
exports.deleteBoat = async (req, res) => {
  try {
    await Boat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Boat deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
