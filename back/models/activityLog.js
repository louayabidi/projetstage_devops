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
        'GOOGLE_LOGIN',
        'PROMOTE_ADMIN',
        'SEARCH_NEARBY_BOATS',
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

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;