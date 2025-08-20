const Booking = require('../models/bookingModel');
const Boat = require('../models/boat');
const User = require('../models/usersModel');
const Message = require('../models/messageModel');
const Notification = require('../models/notificationModel');

// Create a new booking request
exports.createBooking = async (req, res) => {
  try {
    console.log('req.user:', req.user);
    const passengerId = req.user._id; // Use _id instead of userId
    console.log('passengerId:', passengerId);
    const {
      numberOfPersons,
      hasKids,
      paymentMethod,
      departureLocation,
      destination,
      numberOfCabins,
      boatId,
      startDate,
      endDate
    } = req.body;

    // Validate required fields
    if (!numberOfPersons || !paymentMethod || !destination || !numberOfCabins || !boatId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get boat and owner
    const boat = await Boat.findById(boatId);
    if (!boat) {
      return res.status(404).json({
        success: false,
        message: 'Boat not found'
      });
    }

    // Check boat availability
    const existingBooking = await Booking.findOne({
      boat: boatId,
      status: { $in: ['accepted', 'pending', 'offered'] },
      $or: [
        { 
          startDate: { $lt: new Date(endDate) },
          endDate: { $gt: new Date(startDate) }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Boat is not available for the selected dates'
      });
    }

    // Create booking
    const booking = new Booking({
      passenger: passengerId,
      boatOwner: boat.owner,
      boat: boatId,
      status: 'pending',
      numberOfPersons,
      hasKids,
      paymentMethod,
      departureLocation: {
        type: 'Point',
        coordinates: departureLocation.coordinates
      },
      destination,
      numberOfCabins,
      startDate,
      endDate
    });

    await booking.save();

    // Add booking to passenger's requests
    await User.findByIdAndUpdate(passengerId, {
      $push: { bookingRequests: booking._id }
    });

    // Create notification for boat owner
    const passenger = await User.findById(passengerId);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Passenger not found'
      });
    }
    console.log('passengerId:', passengerId);
    console.log('boat.owner:', boat.owner);
    console.log('passengerId from token:', req.user._id); // Update to _id

    const notification = new Notification({
      recipient: boat.owner,
      sender: passengerId,
      booking: booking._id,
      type: 'new_booking',
      message: `New booking request from ${passenger.firstName} ${passenger.lastName}`,
      isRead: false
    });

    await notification.save();

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking request sent successfully'
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get bookings for boat owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user._id; // Changed from req.user.userId
    console.log('Fetching bookings for ownerId:', ownerId); // Debug log
    const bookings = await Booking.find({ boatOwner: ownerId })
      .populate('passenger', 'firstName lastName email phoneNumber')
      .populate('boat', 'name boatType boatCapacity');

    console.log('Bookings found:', bookings); // Debug log
    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.makeOffer = async (req, res) => {
  try {
    const { offerPrice, message } = req.body;
    const { bookingId } = req.params;
    const ownerId = req.user._id; // Use _id
    console.log('Authenticated ownerId:', ownerId);
    const booking = await Booking.findById(bookingId).populate('boat');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    console.log('Booking boatOwner:', booking.boatOwner);
    if (booking.boatOwner.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    booking.status = 'offered';
    booking.offerPrice = offerPrice;
    booking.offerMessage = message;
    await booking.save();
    res.status(200).json({ success: true, message: 'Offer made successfully', booking });
  } catch (error) {
    console.error('Error in makeOffer:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// Passenger accepts offer
exports.acceptOffer = async (req, res) => {
  try {
    const passengerId = req.user.userId;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.passenger.toString() !== passengerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'offered') {
      return res.status(400).json({
        success: false,
        message: 'No offer to accept'
      });
    }

    // Update booking status
    booking.status = 'accepted';
    await booking.save();

    // Update user references
    await User.findByIdAndUpdate(passengerId, {
      $pull: { bookingRequests: booking._id },
      $push: { confirmedBookings: booking._id }
    });

    await User.findByIdAndUpdate(booking.boatOwner, {
      $pull: { bookingOffers: booking._id },
      $push: { confirmedBookings: booking._id }
    });

    // Create notification for boat owner
    const passenger = await User.findById(passengerId);
    const notification = new Notification({
      recipient: booking.boatOwner,
      sender: passengerId,
      booking: booking._id,
      type: 'booking_accepted',
      message: `${passenger.firstName} ${passenger.lastName} accepted your offer`,
      isRead: false
    });

    await notification.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Offer accepted successfully'
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get messages for a booking
exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is part of this booking
    if (booking.passenger.toString() !== userId && booking.boatOwner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const messages = await Message.find({ booking: bookingId })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName');

    res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Send message in booking chat
exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;
    const senderId = req.user.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is part of this booking
    if (booking.passenger.toString() !== senderId && booking.boatOwner.toString() !== senderId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const message = new Message({
      booking: bookingId,
      sender: senderId,
      content
    });

    await message.save();

    // Determine recipient
    const recipientId = booking.passenger.toString() === senderId 
      ? booking.boatOwner 
      : booking.passenger;

    // Create notification
    const sender = await User.findById(senderId);
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      booking: booking._id,
      type: 'new_message',
      message: `New message from ${sender.firstName} ${sender.lastName}`,
      isRead: false
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};