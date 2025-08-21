const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId, // Fixed from String
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId, // Fixed from String
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  type: {
    type: String,
    enum: ['new_booking', 'booking_offer', 'booking_accepted', 'new_message'], // Added booking_offer
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);