const mongoose = require("mongoose");

const boatSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    boatType: { type: String, required: true },
    boatCapacity: { type: Number, min: 1, required: true },
    boatLicense: { type: String, unique: true, required: true },
    amenities: [{ type: String }],
    photos: [{ type: String }],
    description: { type: String},
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    isRejected: { type: Boolean, default: false },  
    rejectionReason: { type: String, default: null },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    lastLocationUpdate: { type: Date },
  },
  { versionKey: false }
);

boatSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Boat", boatSchema);