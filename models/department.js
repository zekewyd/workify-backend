const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, trim: true },
  jobTitle: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);
