const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
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
  boat: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Boat' 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  verificationCode: { 
    type: String, 
    select: false 
  },
  verificationCodeValidation: { 
    type: Date, 
    select: false 
  },
  // Booking references
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
  }]
}, { 
  timestamps: true 
});

// Password hashing middleware


module.exports = mongoose.model('User', userSchema);