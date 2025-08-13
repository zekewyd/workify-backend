const mongoose = require("mongoose");

const emergencyInfoSchema = new mongoose.Schema({
  emergencyID: { type: mongoose.Schema.Types.ObjectId, auto: true },
  pInfoID: { type: mongoose.Schema.Types.ObjectId, ref: "PersonalInfo", required: true },
  contactName: { type: String, required: true },
  contactNo: { type: String, required: true },
  relationship: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("EmergencyInfo", emergencyInfoSchema);
