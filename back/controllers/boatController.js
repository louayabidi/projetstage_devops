const Boat = require('../models/boat');
const User = require('../models/usersModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../Uploads/boats');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/boats/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const uploadBoat = multer({ storage, fileFilter }).fields([
  { name: 'photos', maxCount: 10 },
  { name: 'boatLicense', maxCount: 1 }
]);

exports.createBoat = [uploadBoat, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, amenities, boatType, boatCapacity, description } = req.body;

    if (!name || !boatType || !boatCapacity || !description) {
      return res.status(400).json({
        success: false,
        message: 'All boat fields are required',
      });
    }

    if (!req.files.boatLicense || req.files.boatLicense.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Boat license photo is required',
      });
    }

    const photos = req.files.photos ? req.files.photos.map(file => `/Uploads/boats/${file.filename}`) : [];
    const boatLicense = `/Uploads/boats/${req.files.boatLicense[0].filename}`;

    let boat = await Boat.findOne({ owner: userId });

    if (boat) {
      // Update existing boat and reset verification/rejection
      boat = await Boat.findOneAndUpdate(
        { owner: userId },
        {
          name,
          boatType,
          boatCapacity,
          boatLicense,
          description,
          amenities: Array.isArray(amenities) ? amenities : [],
          photos,
          isVerified: false, // Reset to unverified
          isRejected: false, // Clear rejection
          rejectionReason: null, // Clear reason
        },
        { new: true }
      );
    } else {
      boat = new Boat({
        owner: userId,
        name,
        boatType,
        boatCapacity,
        boatLicense,
        description,
        amenities: Array.isArray(amenities) ? amenities : [],
        photos,
        isVerified: false,
        isRejected: false,
        rejectionReason: null,
      });
      await boat.save();
    }

    // Update user to reflect boat info completion and reset status
    await User.findByIdAndUpdate(
      userId,
      {
        boatInfoComplete: true,
        verified: false,
        rejected: false,
        rejectionReason: null,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Boat information saved successfully',
      boat,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
}];

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
      .populate('owner', 'firstName lastName');
    console.log('Fetched boats:', boats);
    res.status(200).json({ success: true, boats });
  } catch (error) {
    console.error('Fetch boat locations error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getBoats = async (req, res) => {
  try {
    const boats = await Boat.find({ isVerified: true, isRejected: false });
    res.status(200).json(boats);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getBoat = async (req, res) => {
  try {
    const boat = await Boat.findById(req.params.id).populate({
      path: 'owner',
      select: 'firstName lastName avatar createdAt'
    });
    
    if (!boat) return res.status(404).json({ message: 'Boat not found' });

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

exports.updateBoat = [
  uploadBoat,
  async (req, res) => {
    try {
      const userId = req.user._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: No user found',
        });
      }

      const { name, boatType, boatCapacity, description, amenities } = req.body;

      let parsedAmenities = [];
      try {
        parsedAmenities = amenities ? JSON.parse(amenities) : [];
      } catch (e) {
        console.error('Error parsing amenities:', e);
      }

      if (!name || !boatType || !boatCapacity || !description) {
        return res.status(400).json({
          success: false,
          message: 'All boat fields are required',
        });
      }

      const photos = req.files.photos ? req.files.photos.map((file) => `/Uploads/boats/${file.filename}`) : undefined;
      const boatLicense = req.files.boatLicense ? `/Uploads/boats/${req.files.boatLicense[0].filename}` : undefined;

      const updateFields = {
        name,
        boatType,
        boatCapacity: Number(boatCapacity),
        description,
        amenities: Array.isArray(parsedAmenities) ? parsedAmenities : [],
        rejectionReason: null,
      };

      if (photos) updateFields.photos = photos;
      if (boatLicense) updateFields.boatLicense = boatLicense;

      const updatedBoat = await Boat.findOneAndUpdate(
        { owner: userId },
        updateFields,
        { new: true, runValidators: true }
      ).lean();

      if (!updatedBoat) {
        return res.status(404).json({
          success: false,
          message: 'No boat found for this user',
        });
      }

      await User.findByIdAndUpdate(
        userId,
        { boatInfoComplete: true, verified: false, rejected: false, rejectionReason: null },
        { new: true }
      );

      return res.json({
        success: true,
        message: 'Boat updated successfully',
        boat: updatedBoat,
      });
    } catch (error) {
      console.error('Update boat error:', error);
      if (req.files.photos && req.files.photos.length > 0) {
        req.files.photos.forEach((file) => {
          try {
            fs.unlinkSync(path.join(uploadDir, file.filename));
          } catch (err) {
            console.error('Error cleaning up file:', err);
          }
        });
      }
      if (req.files.boatLicense && req.files.boatLicense.length > 0) {
        req.files.boatLicense.forEach((file) => {
          try {
            fs.unlinkSync(path.join(uploadDir, file.filename));
          } catch (err) {
            console.error('Error cleaning up file:', err);
          }
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
];

exports.getBoatByOwner = async (req, res) => {
  try 
  {
    const userId = req.user._id;
    const boat = await Boat.findOne({ owner: userId }).populate({

   path : 'owner',
    select : 'firstName lastName',

    });

      if(!boat) {
        return res.status(404).json({ success: false , message: 'Boat not found for this user' });
      }

      const boatObj = boat.toObject();
      boatObj.owner = {
        name: boatObj.owner.firstName ? `${boatObj.owner.firstName} ${boatObj.owner.lastName || ''}`.trim() : 'Boat Owner'
      };

      res.json({ success: true, boat: boatObj });
  } catch (error) {
    console.error('Get boat by owner error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });


  }

};

exports.completeBoatInfo = [
  uploadBoat,
  async (req, res) => {
    try {
      console.log("Authenticated user:", req.user);
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const userId = req.user._id;
      const { name, boatType, boatCapacity, description, amenities } = req.body;

      let parsedAmenities = [];
      try {
        parsedAmenities = amenities ? JSON.parse(amenities) : [];
      } catch (e) {
        console.error("Error parsing amenities:", e);
      }

      if (!name || !boatType || !boatCapacity || !description) {
        return res.status(400).json({
          success: false,
          message: "All boat fields are required",
        });
      }

      if (!req.files.boatLicense || req.files.boatLicense.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Boat license photo is required',
        });
      }

      const photos = req.files.photos ? req.files.photos.map((file) => `/Uploads/boats/${file.filename}`) : [];
      const boatLicense = `/Uploads/boats/${req.files.boatLicense[0].filename}`;

      const updatedBoat = await Boat.findOneAndUpdate(
        { owner: userId },
        {
          owner: userId,
          name,
          boatType,
          boatCapacity: Number(boatCapacity),
          boatLicense,
          description, // New field
          amenities: Array.isArray(parsedAmenities) ? parsedAmenities : [],
          photos,
          isVerified: false,
        },
        {
          new: true,
          upsert: true,
        }
      );

      await User.findByIdAndUpdate(
        userId,
        { boat: updatedBoat._id, boatInfoComplete: true },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Boat information submitted successfully",
        boat: updatedBoat,
      });
    } catch (error) {
      console.error("CompleteBoatInfo error:", error);
      if (req.files.photos && req.files.photos.length > 0) {
        req.files.photos.forEach((file) => {
          try {
            fs.unlinkSync(path.join(uploadDir, file.filename));
          } catch (err) {
            console.error("Error cleaning up file:", err);
          }
        });
      }
      if (req.files.boatLicense && req.files.boatLicense.length > 0) {
        req.files.boatLicense.forEach((file) => {
          try {
            fs.unlinkSync(path.join(uploadDir, file.filename));
          } catch (err) {
            console.error("Error cleaning up file:", err);
          }
        });
      }
      return res.status(500).json({
        success: false,
        message: "Server error updating boat info",
        error: error.message,
      });
    }
  },
];

exports.updateBoat = [uploadBoat, async (req, res) => {
  console.log('=== UPDATE BOAT CONTROLLER STARTED ===');
  try {
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);

    const userId = req.user._id;
    if (!userId) {
      console.log('No user ID found');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user found'
      });
    }

    const { name, amenities } = req.body;
    console.log('Extracted data:', { name, amenities });

    if (!name) {
      console.log('Validation failed - no name');
      return res.status(400).json({
        success: false,
        message: 'Boat name required'
      });
    }

    console.log('Searching for boat with owner:', userId);

    const photos = req.files.photos ? req.files.photos.map((file) => `/Uploads/boats/${file.filename}`) : undefined;
    const boatLicense = req.files.boatLicense ? `/Uploads/boats/${req.files.boatLicense[0].filename}` : undefined;

    const updateFields = {
      name,
      amenities: Array.isArray(amenities) ? amenities : [],
      isVerified: true
    };

    if (photos) updateFields.photos = photos;
    if (boatLicense) updateFields.boatLicense = boatLicense;

    const updatedBoat = await Boat.findOneAndUpdate(
      { owner: userId },
      updateFields,
      { new: true, runValidators: true }
    ).lean();

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
      userId,
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
    if (req.files.photos && req.files.photos.length > 0) {
      req.files.photos.forEach((file) => {
        try {
          fs.unlinkSync(path.join(uploadDir, file.filename));
        } catch (err) {
          console.error('Error cleaning up file:', err);
        }
      });
    }
    if (req.files.boatLicense && req.files.boatLicense.length > 0) {
      req.files.boatLicense.forEach((file) => {
        try {
          fs.unlinkSync(path.join(uploadDir, file.filename));
        } catch (err) {
          console.error('Error cleaning up file:', err);
        }
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}];

exports.deleteBoat = async (req, res) => {
  try {
    await Boat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Boat deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.downloadBoatLicense = async (req, res) => {
  try {
    const boatId = req.params.boatId;
    const boat = await Boat.findById(boatId);

    if (!boat || !boat.boatLicense) {
      return res.status(404).json({ success: false, message: 'License not found' });
    }

    // Must be an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const filePath = path.join(__dirname, '../', boat.boatLicense);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'License file not found on server' });
    }

    res.download(filePath, `boat_license_${boatId}${path.extname(boat.boatLicense)}`);
  } catch (error) {
    console.error('Download license error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


exports.getNearbyBoats = async (req, res) => {
  try {
    // Verify user role
    if (req.user.role !== 'passenger') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Passenger role required' });
    }

    const { latitude, longitude, maxDistance = 10000 } = req.body; // maxDistance in meters (default 10km)
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Passenger location (latitude, longitude) is required' });
    }

    const nearbyBoats = await Boat.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          distanceField: 'distance', // Adds a 'distance' field in meters
          maxDistance: parseInt(maxDistance),
          spherical: true,
          query: {
            isVerified: true,
            isRejected: false,
            lastLocationUpdate: { $gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner'
        }
      },
      { $unwind: '$owner' },
      {
        $project: {
          _id: 1,
          name: 1,
          boatType: 1,
          boatCapacity: 1,
          location: 1,
          distance: { $divide: ['$distance', 1000] }, // Convert to km
          'owner.firstName': 1,
          'owner.lastName': 1
        }
      },
      { $sort: { distance: 1 } } // Sort by closest first
    ]);

    if (!nearbyBoats.length) {
      return res.status(404).json({ success: false, message: 'No nearby boats found' });
    }

    // Log activity (optional)
    const ActivityLog = require('../models/activityLog');
    const activityLog = new ActivityLog({
      userId: req.user._id,
      action: 'SEARCH_NEARBY_BOATS',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
    });
    await activityLog.save();

    res.status(200).json({ success: true, boats: nearbyBoats });
  } catch (error) {
    console.error('Get nearby boats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};