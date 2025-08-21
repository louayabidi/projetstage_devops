const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId, // Fixed from String
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isOffer: {
    type: Boolean,
    default: false
  },
  offerPrice: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);