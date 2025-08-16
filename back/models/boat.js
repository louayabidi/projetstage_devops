// backend/models/Boat.js
const mongoose = require('mongoose');

const boatSchema = new mongoose.Schema({
  owner: { type: String, ref: 'User' }, // Keep as String
  name: { type: String },
  boatType: { type: String },
  boatCapacity: { type: Number, min: 1 },
  boatLicense: { type: String, unique: true },
  amenities: [{ type: String }],
  photos: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  lastLocationUpdate: { type: Date }
}, { versionKey: false });

boatSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Boat', boatSchema);