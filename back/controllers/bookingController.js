const Booking = require('../models/bookingModel');
const Boat = require('../models/boat');
const User = require('../models/usersModel');

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user._id; // use _id not userId
    const {
      numberOfPersons,
      hasKids,
      paymentMethod,
      destination,
      numberOfCabins,
      departureLocation
    } = req.body;

    // Extract longitude, latitude from GeoJSON
    const [longitude, latitude] = departureLocation.coordinates;

    const newBooking = new Booking({
      passenger: userId,
      numberOfPersons,
      hasKids: hasKids === 'true' || hasKids === true,
      paymentMethod,
      departureLocation: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      destination,
      numberOfCabins
    });

    const savedBooking = await newBooking.save();

    // Find nearby boats within 10km
console.log('Searching boats near:', longitude, latitude);

const nearbyBoats = await Boat.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 10000
    }
  }
});

console.log('Nearby boats found:', nearbyBoats.length);
nearbyBoats.forEach(boat => {
  console.log('Boat location:', boat.location.coordinates);
});


    console.log('Nearby boats found:', nearbyBoats.length);

    const ownerIds = nearbyBoats.map(boat => boat.owner);
    console.log('Owner IDs to notify:', ownerIds);

    if (ownerIds.length > 0) {
      // Notify boat owners by updating their bookingRequests array
      const result = await User.updateMany(
        { _id: { $in: ownerIds } },
        { $push: { bookingRequests: savedBooking._id } }
      );
      console.log('Updated users:', result.modifiedCount);
      console.log(`Updated ${result.modifiedCount} users`);
    } else {
      console.log('No boat owners to notify');
    }

    res.status(201).json({
      success: true,
      booking: savedBooking,
      message: 'Booking request sent to nearby boat owners'
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};



exports.notifyAllBoatOwners = async (req, res) => {
  try {
    // Récupérer tous les bateaux
    const boats = await Boat.find();

    // Extraire les IDs des propriétaires
    const ownerIds = [...new Set(boats.map(boat => boat.ownerId))];

    // Afficher ou envoyer une notification à tous les owners
    console.log("Booking request sent to owners:", ownerIds);

    // Ex: créer une "booking request" ou envoyer un email/notif
    // (code à ajouter selon ta logique)

    res.status(200).json({
      message: `Booking request sent to ${ownerIds.length} owners.`,
      ownerIds
    });
  } catch (error) {
    console.error('Error notifying owners:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get booking requests for boat owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const userId = req.user._id;  
    
    const user = await User.findById(userId)
      .populate({
        path: 'bookingRequests',
        match: { status: 'pending' }
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

console.log('Owner:', user);
console.log('BookingRequests:', user.bookingRequests);


    res.status(200).json({
      success: true,
      bookings: user.bookingRequests || []
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};


// Boat owner makes offer
exports.makeOffer = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { price } = req.body;
    const boatId = req.body.boatId;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'offered',
        offerPrice: price,
        boat: boatId,
        boatOwner: req.user.userId
      },
      { new: true }
    );

    // Notify passenger (in real app, use push notification)
    await User.findByIdAndUpdate(
      updatedBooking.passenger,
      { $push: { bookingOffers: updatedBooking._id } }
    );

    res.status(200).json({
      success: true,
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error making offer'
    });
  }
};

// Passenger accepts offer
exports.acceptOffer = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'accepted' },
      { new: true }
    );

    // Notify boat owner
    await User.findByIdAndUpdate(
      booking.boatOwner,
      { $push: { confirmedBookings: bookingId } }
    );

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting offer'
    });
  }
};