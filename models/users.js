const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "hr", "employee"], default: "employee" },
  isVerified: { type: Boolean, default: false },

  // disable users
  isDisabled: { type: Boolean, default: false },
  disabledAt: { type: Date, default: null },
  disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

}, { timestamps: true }); //gives createdAt and updatedAt

module.exports = mongoose.model("Users", userSchema);
