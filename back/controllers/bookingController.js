const express = require('express');
const mongoose = require("mongoose");
const axios = require('axios');
const Booking = require('../models/bookingModel');
const Boat = require('../models/boat');
const User = require('../models/usersModel');
const Message = require('../models/messageModel');
const Notification = require('../models/notificationModel');





//the review flow
exports.submitReview = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const { bookingId, rating, comment } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required and must be between 1 and 5',
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('boatOwner');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Ensure the user is the passenger and the booking is confirmed
    if (booking.passenger.toString() !== passengerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the passenger can submit a review',
      });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for confirmed bookings',
      });
    }

    // Check if the passenger has already reviewed this booking
    const boatOwner = await User.findById(booking.boatOwner._id);
    const existingReview = boatOwner.reviews.find(
      (review) => review.passenger.toString() === passengerId.toString() && review.booking?.toString() === bookingId
    );
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this boat owner for this booking',
      });
    }

    // Add review to boat owner
    boatOwner.reviews.push({
      passenger: passengerId,
      rating,
      comment,
      booking: bookingId,
    });

    // Calculate and update averageRating
    const totalRating = boatOwner.reviews.reduce((sum, review) => sum + review.rating, 0);
    boatOwner.averageRating = boatOwner.reviews.length ? totalRating / boatOwner.reviews.length : 0;

    await boatOwner.save();

    // Create a notification for the boat owner
    const passenger = await User.findById(passengerId);
    const notification = new Notification({
      recipient: booking.boatOwner,
      sender: passengerId,
      booking: booking._id,
      type: 'new_review',
      message: `New review from ${passenger.firstName} ${passenger.lastName}: ${rating}/5`,
      isRead: false,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: { passenger: passengerId, rating, comment, createdAt: new Date() },
      averageRating: boatOwner.averageRating, // Include updated averageRating
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get bookings for the logged-in passenger
exports.getPassengerBookings = async (req, res) => {
  try {
    const passengerId = req.user._id;
    const bookings = await Booking.find({ passenger: passengerId })
      .populate('boatOwner', 'firstName lastName email phoneNumber')
      .populate('boat', 'name boatType boatCapacity');

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Get passenger bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// Get reviews for a boat owner

exports.getBoatOwnerReviews = async (req, res) => {
  try {
    const { boatOwnerId } = req.params;

    console.log('Received boatOwnerId:', boatOwnerId);

    if (!mongoose.Types.ObjectId.isValid(boatOwnerId)) {
      console.log('Invalid boatOwnerId:', boatOwnerId);
      return res.status(400).json({
        success: false,
        message: 'Invalid boat owner ID',
      });
    }

    const boatOwner = await User.findById(boatOwnerId)
      .populate('reviews.passenger', 'firstName lastName photo')
      .select('reviews averageRating role');

    if (!boatOwner) {
      console.log('Boat owner not found in database:', boatOwnerId);
      return res.status(404).json({
        success: false,
        message: 'Boat owner not found',
      });
    }

    console.log('Boat owner found:', {
      id: boatOwner._id.toString(),
      role: boatOwner.role,
      reviews: boatOwner.reviews,
      averageRating: boatOwner.averageRating
    });

    if (boatOwner.role !== 'boat_owner') {
      console.log('Role mismatch:', boatOwner.role);
      return res.status(404).json({
        success: false,
        message: 'Boat owner not found',
      });
    }

    res.status(200).json({
      success: true,
      averageRating: boatOwner.averageRating || 0,
      reviews: boatOwner.reviews || [],
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

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
      endDate,
      reservationType, // New field
    } = req.body;

    // Validate input
    if (
      !numberOfPersons ||
      !paymentMethod ||
      !destination ||
      !numberOfCabins ||
      !boatId ||
      !startDate ||
      !endDate ||
      !reservationType
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const boat = await Boat.findById(boatId);
    if (!boat) {
      return res.status(404).json({
        success: false,
        message: 'Boat not found',
      });
    }

    // Validate numberOfPersons against boat capacity
    if (numberOfPersons > boat.boatCapacity) {
      return res.status(400).json({
        success: false,
        message: `Number of persons (${numberOfPersons}) exceeds boat capacity (${boat.boatCapacity})`,
      });
    }

    // Check availability based on reservation type
    const existingBookings = await Booking.find({
      boat: boatId,
      status: { $in: ['pending', 'offered', 'confirmed'] },
      $or: [
        {
          startDate: { $lt: new Date(endDate) },
          endDate: { $gt: new Date(startDate) },
        },
      ],
    });

    if (reservationType === 'exclusive') {
      // For exclusive bookings, no overlapping bookings are allowed
      if (existingBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Boat is not available for the selected dates (exclusive reservation)',
        });
      }
    } else if (reservationType === 'shared') {
      // For shared bookings, check total number of persons
      const totalPersons = existingBookings.reduce(
        (sum, booking) => sum + booking.numberOfPersons,
        0
      );
      if (totalPersons + numberOfPersons > boat.boatCapacity) {
        return res.status(400).json({
          success: false,
          message: `Boat capacity exceeded. Current: ${totalPersons}, Requested: ${numberOfPersons}, Capacity: ${boat.boatCapacity}`,
        });
      }
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
        coordinates: departureLocation.coordinates,
      },
      destination: {
        type: 'Point',
        coordinates: destination.coordinates,
      },
      numberOfCabins,
      startDate,
      endDate,
      reservationType,
    });

    await booking.save();

    await User.findByIdAndUpdate(passengerId, {
      $push: { bookingRequests: booking._id },
    });

    const passenger = await User.findById(passengerId);
    const notification = new Notification({
      recipient: boat.owner,
      sender: passengerId,
      booking: booking._id,
      type: 'new_booking',
      message: `New ${reservationType} booking request from ${passenger.firstName} ${passenger.lastName}`,
      isRead: false,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      booking,
      message: 'Booking request sent successfully',
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
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

    const booking = await Booking.findById(bookingId).populate('boat');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.passenger.toString() !== passengerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (booking.status !== 'offered') {
      return res.status(400).json({
        success: false,
        message: 'No offer to accept',
      });
    }

    // Re-check boat availability for the selected dates
    const existingBookings = await Booking.find({
      boat: booking.boat,
      status: 'confirmed',
      _id: { $ne: bookingId }, // Exclude the current booking
      $or: [
        {
          startDate: { $lt: new Date(booking.endDate) },
          endDate: { $gt: new Date(booking.startDate) },
        },
      ],
    });

    if (booking.reservationType === 'exclusive' && existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Boat is no longer available for the selected dates (exclusive reservation)',
      });
    } else if (booking.reservationType === 'shared') {
      const totalPersons = existingBookings.reduce(
        (sum, b) => sum + b.numberOfPersons,
        0
      );
      if (totalPersons + booking.numberOfPersons > booking.boat.boatCapacity) {
        return res.status(400).json({
          success: false,
          message: `Boat capacity exceeded. Current: ${totalPersons}, Requested: ${booking.numberOfPersons}, Capacity: ${booking.boat.boatCapacity}`,
        });
      }
    }

    booking.status = 'confirmed';
    await booking.save();

    await User.findByIdAndUpdate(passengerId, {
      $pull: { bookingRequests: booking._id },
      $push: { confirmedBookings: booking._id },
    });

    await User.findByIdAndUpdate(booking.boatOwner, {
      $pull: { bookingOffers: booking._id },
      $push: { confirmedBookings: booking._id },
    });

    const passenger = await User.findById(passengerId);
    const notification = new Notification({
      recipient: booking.boatOwner,
      sender: passengerId,
      booking: booking._id,
      type: 'booking_confirmed',
      message: `${passenger.firstName} ${passenger.lastName} accepted your offer and confirmed the ${booking.reservationType} booking`,
      isRead: false,
    });

    await notification.save();

    res.status(200).json({
      success: true,
      booking,
      message: 'Offer accepted and booking confirmed',
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
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

// Fetch weather data for a location
exports.getWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Weather API key not configured' });
    }

    console.log('Fetching weather for:', { lat, lng }); // Debug log

    // Fetch current weather
    const currentWeatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    ).catch(error => {
      console.error('Current weather API error:', error.response?.data || error.message);
      throw error;
    });

    // Fetch 5-day forecast
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    ).catch(error => {
      console.error('Forecast API error:', error.response?.data || error.message);
      throw error;
    });

    // Process current weather
    const current = {
      temp: currentWeatherResponse.data.main.temp,
      description: currentWeatherResponse.data.weather[0].description,
      icon: currentWeatherResponse.data.weather[0].icon,
      wind_speed: currentWeatherResponse.data.wind.speed,
      humidity: currentWeatherResponse.data.main.humidity,
    };

    // Process forecast
    const forecast = [];
    const dailyData = forecastResponse.data.list.filter(item => item.dt_txt.includes('12:00:00'));
    console.log('Filtered forecast data:', dailyData); // Debug log
    dailyData.forEach(item => {
      forecast.push({
        dt: item.dt,
        temp: item.main.temp,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      });
    });

    res.status(200).json({
      success: true,
      current,
      forecast,
    });
  } catch (error) {
    console.error('Fetch weather error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
      error: error.message,
    });
  }
};