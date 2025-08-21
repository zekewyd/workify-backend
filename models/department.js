const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true, trim: true },
  jobTitles: { type: [String], default: [] }, 
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);
