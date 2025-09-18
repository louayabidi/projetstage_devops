const mongoose = require('mongoose');

const travelInterestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupSize: {
    type: Number,
    required: true,
    min: 1
  },
  hasKids: {
    type: Boolean,
    default: false
  },
  departureLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  destination: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  interests: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  message: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

travelInterestSchema.index({ departureLocation: '2dsphere' });
travelInterestSchema.index({ destination: '2dsphere' });
travelInterestSchema.statics.predefinedInterests = function() {
  return [
    'adventure', 'relaxation', 'fishing', 'snorkeling', 'sailing', 'beach_hopping',
    'wildlife', 'cultural', 'foodie', 'party', 'family_friendly', 'solo_travel'
  ];
};
module.exports = mongoose.model('TravelInterest', travelInterestSchema);