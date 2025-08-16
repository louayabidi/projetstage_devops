const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  passenger: { 
    type: String, 
    ref: 'User',
    required: true
  },
  boatOwner: {
    type: String,
    ref: 'User'
  },
  boat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Boat'
  },
  status: {
    type: String,
    enum: ['pending', 'offered', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  numberOfPersons: {
    type: Number,
    required: true
  },
  hasKids: Boolean,
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'cash'],
    required: true
  },
  departureLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] 
  },
  destination: {
    type: String,
    required: true
  },
  numberOfCabins: {
    type: Number,
    required: true
  },
  offerPrice: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index({ departureLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);