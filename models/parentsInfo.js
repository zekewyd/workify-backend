const mongoose = require("mongoose");

const parentsInfoSchema = new mongoose.Schema({
  parentsID: { type: mongoose.Schema.Types.ObjectId, auto: true },
  pInfoID: { type: mongoose.Schema.Types.ObjectId, ref: "PersonalInfo", required: true },
  motherName: { type: String, required: true },
  mPhoneNo: { type: String, required: true },
  mOccupation: { type: String, required: true },
  mAddress: { type: String, required: true },
  mStatus: { type: String, enum: ["alive", "deceased"], required: true },
  fatherName: { type: String, required: true },
  fPhoneNo: { type: String, required: true },
  fOccupation: { type: String, required: true },
  fAddress: { type: String, required: true },
  fStatus: { type: String, enum: ["alive", "deceased"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("ParentsInfo", parentsInfoSchema);
