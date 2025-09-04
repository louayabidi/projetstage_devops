const TravelInterest = require('../models/travelInterest');

exports.createTravelInterest = async (req, res) => {
  try {
    const {
      groupSize,
      hasKids,
      departureLocation, // Expect { coordinates: [lng, lat] }
      destination, // Expect { coordinates: [lng, lat] }
      startDate,
      endDate,
      interests,
      message
    } = req.body;

    // Basic validation
    if (!departureLocation?.coordinates || !destination?.coordinates) {
      return res.status(400).json({ success: false, message: 'Location coordinates are required' });
    }

    const travelInterest = new TravelInterest({
      user: req.user._id,
      groupSize,
      hasKids,
      departureLocation: {
        type: 'Point',
        coordinates: departureLocation.coordinates
      },
      destination: {
        type: 'Point',
        coordinates: destination.coordinates
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      interests,
      message
    });

    await travelInterest.save();
    res.status(201).json({ success: true, travelInterest });
  } catch (error) {
    console.error('Create travel interest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSuggestedCompanions = async (req, res) => {
  try {
    const {
      departureLng,
      departureLat,
      destinationLng,
      destinationLat,
      startDate,
      endDate,
      interests // comma-separated string, e.g., "adventure,relaxation"
    } = req.query;

    if (!departureLng || !departureLat || !destinationLng || !destinationLat || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'All query parameters are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const interestArray = interests ? interests.split(',') : [];
    const maxDistMeters = 100000; // 100km radius, adjustable
    const earthRadius = 6378100; // meters

    const matches = await TravelInterest.find({
      isActive: true,
      user: { $ne: req.user._id },
      $and: [
        { startDate: { $lt: end } },
        { endDate: { $gt: start } }
      ],
      interests: { $in: interestArray },
      departureLocation: {
        $geoWithin: {
          $centerSphere: [[parseFloat(departureLng), parseFloat(departureLat)], maxDistMeters / earthRadius]
        }
      },
      destination: {
        $geoWithin: {
          $centerSphere: [[parseFloat(destinationLng), parseFloat(destinationLat)], maxDistMeters / earthRadius]
        }
      }
    }).populate('user', 'firstName lastName avatar photo phoneNumber email');

    res.status(200).json({ success: true, suggestions: matches });
  } catch (error) {
    console.error('Get suggested companions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMyTravelInterests = async (req, res) => {
  try {
    const interests = await TravelInterest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, interests });
  } catch (error) {
    console.error('Get my travel interests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deactivateTravelInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const interest = await TravelInterest.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!interest) {
      return res.status(404).json({ success: false, message: 'Travel interest not found' });
    }
    res.status(200).json({ success: true, interest });
  } catch (error) {
    console.error('Deactivate travel interest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};