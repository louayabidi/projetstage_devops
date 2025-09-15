const mongoose = require("mongoose");


const activityLogSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'PASSWORD_CHANGE',
        'SIGNUP',
        'CREATE_BOOKING',
        'ACCEPT_BOOKING',
        'REJECT_BOOKING',
        'MAKE_OFFER',
        'SUBMIT_REVIEW',
        'SEND_MESSAGE',
        'UPDATE_LOCATION',
        'VERIFY_USER',
        'REJECT_USER',
      ],
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);