const mongoose = require("mongoose");

const personalInfoSchema = new mongoose.Schema({
  pInfoID: { type: mongoose.Schema.Types.ObjectId, auto: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  employeeNo: { type: String, unique: true, required: true },
  hireDate: { type: Date, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  age: { type: Number, required: true },
  birthDate: { type: Date, required: true },
  birthPlace: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  civilStatus: { type: String, required: true },
  nationality: { type: String, required: true },
  fullAddress: { type: String, required: true },
  sssNo: { type: String, required: true },
  tinNo: { type: String, required: true },
  philHealthNo: { type: String, required: true },
  gsisNo: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("PersonalInfo", personalInfoSchema);
