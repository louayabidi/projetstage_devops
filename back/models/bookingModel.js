const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boatOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
  status: { type: String, enum: ['pending', 'offered', 'confirmed', 'canceled'], default: 'pending' },
  numberOfPersons: { type: Number, required: true },
  hasKids: { type: Boolean, default: false },
  paymentMethod: { type: String, required: true },
  departureLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  destination: { type: String, required: true },
  numberOfCabins: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  offerPrice: { type: Number },
  offerMessage: { type: String },
  currentLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
}, { timestamps: true });

bookingSchema.index({ 'departureLocation.coordinates': '2dsphere' });
bookingSchema.index({ 'currentLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);