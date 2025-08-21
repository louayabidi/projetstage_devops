const Booking = require('../models/bookingModel');
const Boat = require('../models/boat');
const User = require('../models/usersModel');
const Message = require('../models/messageModel');
const Notification = require('../models/notificationModel');

// Create a new booking request
exports.createBooking = async (req, res) => {
  try {
    const passengerId = req.user._id;
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

    if (!numberOfPersons || !paymentMethod || !destination || !numberOfCabins || !boatId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const boat = await Boat.findById(boatId);
    if (!boat) {
      return res.status(404).json({
        success: false,
        message: 'Boat not found'
      });
    }

    const existingBooking = await Booking.findOne({
      boat: boatId,
      status: { $in: ['pending', 'offered', 'confirmed'] },
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

    await User.findByIdAndUpdate(passengerId, {
      $push: { bookingRequests: booking._id }
    });

    const passenger = await User.findById(passengerId);
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
    const ownerId = req.user._id;
    const bookings = await Booking.find({ boatOwner: ownerId })
      .populate('passenger', 'firstName lastName email phoneNumber')
      .populate('boat', 'name boatType boatCapacity');

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

// Boat owner makes offer
exports.makeOffer = async (req, res) => {
  try {
    const { offerPrice, message } = req.body;
    const { bookingId } = req.params;
    const ownerId = req.user._id;

    console.log('makeOffer request:', { bookingId, ownerId, offerPrice, message });

    if (!offerPrice || isNaN(parseFloat(offerPrice))) {
      return res.status(400).json({ success: false, message: 'Invalid or missing offer price' });
    }

    const booking = await Booking.findById(bookingId).populate('boat');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.boatOwner.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    booking.set({
      status: 'offered',
      offerPrice: parseFloat(offerPrice),
      offerMessage: message || '',
    });
    await booking.save({ validateModifiedOnly: true });

    const owner = await User.findById(ownerId);
    const notification = new Notification({
      recipient: booking.passenger,
      sender: ownerId,
      booking: booking._id,
      type: 'booking_offer',
      message: `New offer from ${owner.firstName} ${owner.lastName} for $${offerPrice}`,
      isRead: false,
    });
    await notification.save();

    res.status(200).json({ success: true, message: 'Offer made successfully', booking });
  } catch (error) {
    console.error('Error in makeOffer:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Passenger accepts offer
exports.acceptOffer = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.passenger.toString() !== passengerId.toString()) {
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

    // Re-check boat availability for the selected dates
    const existingBooking = await Booking.findOne({
      boat: booking.boat,
      status: 'confirmed',
      _id: { $ne: bookingId }, // Exclude the current booking
      $or: [
        { 
          startDate: { $lt: new Date(booking.endDate) },
          endDate: { $gt: new Date(booking.startDate) }
        }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Boat is no longer available for the selected dates'
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    await User.findByIdAndUpdate(passengerId, {
      $pull: { bookingRequests: booking._id },
      $push: { confirmedBookings: booking._id }
    });

    await User.findByIdAndUpdate(booking.boatOwner, {
      $pull: { bookingOffers: booking._id },
      $push: { confirmedBookings: booking._id }
    });

    const passenger = await User.findById(passengerId);
    const notification = new Notification({
      recipient: booking.boatOwner,
      sender: passengerId,
      booking: booking._id,
      type: 'booking_confirmed',
      message: `${passenger.firstName} ${passenger.lastName} accepted your offer and confirmed the booking`,
      isRead: false
    });

    await notification.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Offer accepted and booking confirmed'
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
// Passenger rejects offer
exports.rejectOffer = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.passenger.toString() !== passengerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (booking.status !== 'offered') {
      return res.status(400).json({
        success: false,
        message: 'No offer to reject'
      });
    }

    booking.status = 'canceled';
    await booking.save();

    await User.findByIdAndUpdate(passengerId, {
      $pull: { bookingRequests: booking._id }
    });

    await User.findByIdAndUpdate(booking.boatOwner, {
      $pull: { bookingOffers: booking._id }
    });

    const passenger = await User.findById(passengerId);
    const notification = new Notification({
      recipient: booking.boatOwner,
      sender: passengerId,
      booking: booking._id,
      type: 'booking_canceled',
      message: `${passenger.firstName} ${passenger.lastName} rejected your offer`,
      isRead: false
    });

    await notification.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Offer rejected and booking canceled'
    });
  } catch (error) {
    console.error('Reject offer error:', error);
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
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.passenger.toString() !== userId.toString() && booking.boatOwner.toString() !== userId.toString()) {
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
    const senderId = req.user._id;

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

    if (booking.passenger.toString() !== senderId.toString() && booking.boatOwner.toString() !== senderId.toString()) {
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

    const recipientId = booking.passenger.toString() === senderId.toString() 
      ? booking.boatOwner 
      : booking.passenger;

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

// Update passenger location
exports.updatePassengerLocation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { currentLocation } = req.body;
    const passengerId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.passenger.toString() !== passengerId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    booking.currentLocation = currentLocation;
    await booking.save();

    res.status(200).json({ success: true, message: 'Location updated successfully', booking });
  } catch (error) {
    console.error('Update passenger location error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId)
      .populate('passenger', 'firstName lastName email phoneNumber')
      .populate('boatOwner', 'firstName lastName email phoneNumber')
      .populate('boat', 'name boatType boatCapacity photos amenities boatLicense');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.passenger._id.toString() !== userId.toString() && booking.boatOwner._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};