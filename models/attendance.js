const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String,
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Clocked In", "Clocked Out"],
      required: true,
    },

    // clock-in details
    clockInAt: { type: Date, required: true },
    clockInLocalYMD: { type: String, required: true }, // YYYY-MM-DD (Asia/Manila day)
    clockInLocation: LocationSchema,
    clockInPhoto: { type: String }, // stored filename

    // clock-out details
    clockOutAt: { type: Date },
    clockOutLocation: LocationSchema,
    clockOutPhoto: { type: String },

    // duration in seconds (computed on clock-out)
    workDurationSec: { type: Number, default: 0 },

    meta: {
      userAgent: String,
      ip: String,
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ userId: 1, clockInLocalYMD: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
