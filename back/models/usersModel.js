const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const reviewSchema = new mongoose.Schema({
  passenger: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    trim: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  avatar: { 
    type: String 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true, 
    select: false 
  },
  phoneNumber: { 
    type: String 
  },
  photo: { 
    type: String,  
    default: '' 
  },
  role: {
    type: String,
    enum: ['passenger', 'boat_owner', 'admin'],
    required: true
  },
  boatInfoComplete: { 
    type: Boolean, 
    default: false 
  },
  rejected: { 
    type: Boolean, 
    default: false 
  },  
  rejectionReason: { 
    type: String,
    default: null 
  },
  boat: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Boat' 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  bookingRequests: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  }],
  bookingOffers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  }],
  confirmedBookings: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking' 
  }],
  reviews: [reviewSchema], // Add reviews array
  averageRating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  }
}, { 
  timestamps: true 
});

// Update averageRating when reviews are added or updated
userSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = parseFloat((totalRating / this.reviews.length).toFixed(1));
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);